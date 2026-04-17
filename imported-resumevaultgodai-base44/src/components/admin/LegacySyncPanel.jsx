import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Zap, CheckCircle2, XCircle, Clock, Mail, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

export default function LegacySyncPanel() {
  const [syncResult, setSyncResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);

  const runSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('syncLegacyPurchases', { days_back: 30, send_emails: true });
      setSyncResult(res.data);
      if (res.data?.success) {
        toast.success(`✅ Sync complete — ${res.data.updated} users updated, ${res.data.emails_sent} emails sent`);
      } else {
        toast.error('Sync returned errors — check details below');
      }
    } catch (e) {
      toast.error('Sync failed: ' + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const runE2E = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await base44.functions.invoke('e2eTest', {});
      setTestResult(res.data);
      if (res.data?.success) {
        toast.success(`🎉 E2E Test PASSED in ${res.data.total_ms}ms ${res.data.under_10s ? '(under 10s ✅)' : '(over 10s ⚠️)'}`);
      } else {
        toast.error('E2E Test FAILED — see step details');
      }
    } catch (e) {
      toast.error('E2E test failed: ' + e.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={runSync} disabled={syncing} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Run Legacy Sync (30 days)'}
        </Button>
        <Button onClick={runE2E} disabled={testing} variant="outline" className="gap-2 border-green-400 text-green-700 hover:bg-green-50">
          <FlaskConical className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
          {testing ? 'Running E2E Test...' : 'Run E2E System Test'}
        </Button>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600" /> Legacy Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <span className="text-xs bg-slate-100 px-2 py-1 rounded">📋 Processed: <strong>{syncResult.processed}</strong></span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Updated: <strong>{syncResult.updated}</strong></span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"><Mail className="w-3 h-3 inline mr-1" />Emails: <strong>{syncResult.emails_sent}</strong></span>
              {syncResult.errors?.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">❌ Errors: <strong>{syncResult.errors.length}</strong></span>
              )}
            </div>
            {syncResult.details?.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {syncResult.details.map((d, i) => (
                  <div key={i} className="text-xs bg-slate-50 rounded px-2 py-1 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="font-medium">{d.email}</span>
                    <span className="text-slate-400">→ {JSON.stringify(d.updates)}</span>
                  </div>
                ))}
              </div>
            )}
            {syncResult.errors?.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {syncResult.errors.map((e, i) => (
                  <div key={i} className="text-xs bg-red-50 rounded px-2 py-1 flex items-center gap-2">
                    <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span>{e.email || e.session}: {e.reason || e.error}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* E2E Result */}
      {testResult && (
        <Card className={`border-2 ${testResult.success ? 'border-green-300' : 'border-red-300'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              E2E Test Results
              <Badge className={testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {testResult.success ? '✅ PASSED' : '❌ FAILED'}
              </Badge>
              {testResult.total_ms && (
                <span className={`text-xs ml-auto font-mono ${testResult.under_10s ? 'text-green-600' : 'text-orange-500'}`}>
                  <Clock className="w-3 h-3 inline mr-1" />{testResult.total_ms}ms {testResult.under_10s ? '✅' : '⚠️ >10s'}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {testResult.steps?.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 text-xs rounded px-2 py-1.5 ${s.status === 'pass' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {s.status === 'pass'
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    : <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                  <span className="font-medium text-slate-700">{s.step}</span>
                  <span className="text-slate-400 font-mono">{s.ms}ms</span>
                  <span className="text-slate-500 truncate">{s.detail}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}