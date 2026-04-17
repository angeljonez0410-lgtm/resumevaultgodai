type PostEntry = {
  id: string;
  platform: string;
  topic: string;
  status: string;
  created_at: string;
};

export default function PostsTable({
  posts,
}: {
  posts: PostEntry[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">Posts</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3 pr-4">Platform</th>
              <th className="py-3 pr-4">Topic</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b">
                <td className="py-3 pr-4 capitalize">{post.platform}</td>
                <td className="py-3 pr-4">{post.topic}</td>
                <td className="py-3 pr-4 capitalize">{post.status}</td>
                <td className="py-3 pr-4">
                  {new Date(post.created_at).toLocaleString()}
                </td>
              </tr>
            ))}

            {!posts.length && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No posts yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
