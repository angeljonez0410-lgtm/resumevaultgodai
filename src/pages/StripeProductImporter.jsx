import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import PageHeader from '../components/ui-custom/PageHeader';

export default function StripeProductImporter() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const downloadTemplate = () => {
    const csvContent = `Product Name,Product Type,Price (USD),Billing Period,Description
Pro Monthly,Subscription,29.00,monthly,Monthly subscription with unlimited resumes and cover letters
Pro Annual,Subscription,290.00,yearly,Annual subscription - save $58/year
Elite Monthly,Subscription,79.00,monthly,Premium tier with all features including interview coaching
Interview Mastery Bundle,One-Time,99.99,one-time,Complete interview preparation system
Executive Resume Package,One-Time,199.99,one-time,Premium resumes for senior roles
Salary Mastery Course,One-Time,149.99,one-time,Negotiate like a pro
Portfolio Website Pro,One-Time,299.99,one-time,Professional portfolio website
50 Credits,One-Time,9.99,one-time,50 AI credits for pay-as-you-go usage
150 Credits,One-Time,24.99,one-time,150 AI credits - save 15%
400 Credits,One-Time,59.99,one-time,400 AI credits - save 25%
1000 Credits,One-Time,129.99,one-time,1000 AI credits - save 35%`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stripe-products-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        name: values[0],
        type: values[1],
        price: parseFloat(values[2]),
        billingPeriod: values[3],
        description: values[4] || ''
      };
    });
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please upload a file first');
      return;
    }

    try {
      setLoading(true);
      const text = await file.text();
      const products = parseCSV(text);

      const response = await base44.functions.invoke('bulkCreateStripeProducts', {
        products
      });

      setResults(response.data);
      
      if (response.data.created > 0) {
        toast.success(`Successfully created ${response.data.created} products in Stripe!`);
      }
      
      if (response.data.failed > 0) {
        toast.error(`Failed to create ${response.data.failed} products`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Stripe Product Importer" 
        subtitle="Bulk import products and prices into your Stripe account"
        icon={Upload}
      />

      <div className="grid gap-6 max-w-4xl">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Import</CardTitle>
            <CardDescription>Follow these steps to bulk-create your Stripe products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <p className="font-medium text-slate-900">Download the template</p>
                <p className="text-sm text-slate-600">Click the button below to download a pre-filled CSV template</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <p className="font-medium text-slate-900">Edit if needed</p>
                <p className="text-sm text-slate-600">Modify prices, descriptions, or add/remove products in Excel or Google Sheets</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="font-medium text-slate-900">Upload and import</p>
                <p className="text-sm text-slate-600">Upload your CSV file and click "Import to Stripe"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <p className="font-medium text-slate-900">Copy Price IDs</p>
                <p className="text-sm text-slate-600">After import, copy the generated Price IDs to your environment variables</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Download */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Download Template</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadTemplate} variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {file ? file.name : 'Click to upload CSV file'}
                </p>
                <p className="text-xs text-slate-500">CSV files only</p>
              </label>
            </div>

            {file && (
              <Button 
                onClick={handleImport} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import to Stripe
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>
                Created: {results.created} | Failed: {results.failed}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.results.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Successfully Created
                  </h3>
                  <div className="space-y-2">
                    {results.results.map((item, i) => (
                      <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="font-medium text-green-900">{item.name}</p>
                        <div className="text-xs text-green-700 mt-1 space-y-1">
                          <p>Product ID: <code className="bg-green-100 px-2 py-0.5 rounded">{item.productId}</code></p>
                          <p>Price ID: <code className="bg-green-100 px-2 py-0.5 rounded font-semibold">{item.priceId}</code></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Failed
                  </h3>
                  <div className="space-y-2">
                    {results.errors.map((item, i) => (
                      <Alert key={i} variant="destructive">
                        <AlertDescription>
                          <span className="font-medium">{item.name}:</span> {item.error}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Next Step:</strong> Copy the Price IDs above and add them as environment variables in your Base44 dashboard (Settings → Environment Variables).
                  Use naming like: VITE_STRIPE_PRO_PRICE_ID, VITE_STRIPE_CREDITS_50_PRICE_ID, etc.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}