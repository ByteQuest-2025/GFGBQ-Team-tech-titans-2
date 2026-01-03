import { Link, CheckCircle, XCircle, Archive, ExternalLink } from 'lucide-react';

function LinkVerificationCard({ link }) {
  const getStatusIcon = (status) => {
    if (status === 'accessible') return <CheckCircle className="text-verified" size={20} />;
    if (status === 'broken') return <XCircle className="text-fake" size={20} />;
    return <Link className="text-gray-400" size={20} />;
  };

  const getStatusBadge = (status) => {
    const config = {
      accessible: { style: 'bg-green-100 text-green-800 border-green-200', label: 'Working' },
      broken: { style: 'bg-red-100 text-red-800 border-red-200', label: 'Broken' }
    };
    const { style, label } = config[status] || {};
    return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${style}`}>{label}</span>;
  };

  const getStatusColor = (status) => {
    if (status === 'accessible') return 'border-l-verified';
    if (status === 'broken') return 'border-l-fake';
    return 'border-l-gray-300';
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 ${getStatusColor(link.status)} shadow-sm p-4 mb-3`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon(link.status)}
          <div className="flex-1 min-w-0">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-700 font-medium break-all">
              {link.url}
            </a>
            {link.http_code && <p className="text-sm text-gray-500 mt-1">HTTP Status: {link.http_code}</p>}
          </div>
        </div>
        {getStatusBadge(link.status)}
      </div>
      {link.details && (
        <div className="mt-3 pl-8 space-y-2">
          {link.details.message && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Message:</span> {link.details.message}
            </p>
          )}
          {link.details.archived && link.details.archive_url && (
            <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
              <Archive className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-900 font-medium mb-1">Archived version available</p>
                <a href={link.details.archive_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 break-all">
                  View on Wayback Machine <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
          {link.details.checked_at && <p className="text-xs text-gray-500">Checked at: {new Date(link.details.checked_at).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
}

export default LinkVerificationCard;