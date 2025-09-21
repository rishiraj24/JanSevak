import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FileText, Download, Search, Calendar, Eye } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: 'Policy' | 'Guideline' | 'Form' | 'Report';
  category: string;
  description: string;
  lastUpdated: string;
  fileSize: string;
  downloadCount: number;
}

export function ResourcesPage() {
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Grievance Handling Standard Operating Procedure',
      type: 'Guideline',
      category: 'Administration',
      description: 'Comprehensive guide for handling citizen grievances according to government standards',
      lastUpdated: '2024-06-10',
      fileSize: '2.4 MB',
      downloadCount: 1247
    },
    {
      id: '2',
      title: 'Public Infrastructure Complaint Form',
      type: 'Form',
      category: 'Infrastructure',
      description: 'Official form for reporting infrastructure-related issues and complaints',
      lastUpdated: '2024-06-08',
      fileSize: '125 KB',
      downloadCount: 3456
    },
    {
      id: '3',
      title: 'Healthcare Service Quality Policy',
      type: 'Policy',
      category: 'Healthcare',
      description: 'Policy document outlining healthcare service standards and quality measures',
      lastUpdated: '2024-06-05',
      fileSize: '1.8 MB',
      downloadCount: 892
    },
    {
      id: '4',
      title: 'Monthly Grievance Resolution Report - May 2024',
      type: 'Report',
      category: 'Reports',
      description: 'Detailed analysis of grievances resolved in May 2024 with statistics and trends',
      lastUpdated: '2024-06-01',
      fileSize: '3.2 MB',
      downloadCount: 567
    },
    {
      id: '5',
      title: 'Education Department Complaint Guidelines',
      type: 'Guideline',
      category: 'Education',
      description: 'Guidelines for handling education-related complaints and grievances',
      lastUpdated: '2024-05-28',
      fileSize: '1.1 MB',
      downloadCount: 734
    },
    {
      id: '6',
      title: 'Environmental Compliance Checklist',
      type: 'Form',
      category: 'Environment',
      description: 'Checklist for environmental compliance verification and reporting',
      lastUpdated: '2024-05-25',
      fileSize: '856 KB',
      downloadCount: 445
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Policy': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Guideline': return 'bg-green-100 text-green-800 border-green-200';
      case 'Form': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Report': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Administration': 'bg-blue-50 text-blue-700',
      'Infrastructure': 'bg-purple-50 text-purple-700',
      'Healthcare': 'bg-red-50 text-red-700',
      'Education': 'bg-green-50 text-green-700',
      'Environment': 'bg-teal-50 text-teal-700',
      'Reports': 'bg-orange-50 text-orange-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Resources & Documentation</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Upload New Resource
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Total Resources</div>
            <div className="text-2xl font-semibold text-gray-900">{resources.length}</div>
          </div>
        </Card>
        <Card className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Total Downloads</div>
            <div className="text-2xl font-semibold text-gray-900">
              {resources.reduce((sum, r) => sum + r.downloadCount, 0).toLocaleString()}
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Categories</div>
            <div className="text-2xl font-semibold text-gray-900">
              {new Set(resources.map(r => r.category)).size}
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-white rounded-xl border shadow-sm">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Last Updated</div>
            <div className="text-sm font-medium text-gray-900">Today</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 bg-white rounded-xl border shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search resources..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">All Types</Button>
            <Button variant="outline" size="sm">Policies</Button>
            <Button variant="outline" size="sm">Guidelines</Button>
            <Button variant="outline" size="sm">Forms</Button>
            <Button variant="outline" size="sm">Reports</Button>
          </div>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 leading-tight">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-2">
                <Badge className={getTypeColor(resource.type)}>
                  {resource.type}
                </Badge>
                <Badge variant="outline" className={getCategoryColor(resource.category)}>
                  {resource.category}
                </Badge>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(resource.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <span>•</span>
                  <span>{resource.fileSize}</span>
                  <span>•</span>
                  <span>{resource.downloadCount} downloads</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </Button>
                <Button size="sm" variant="outline" className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Access Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="bg-white hover:bg-gray-50 justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Complaint Forms
          </Button>
          <Button variant="outline" className="bg-white hover:bg-gray-50 justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Policy Documents
          </Button>
          <Button variant="outline" className="bg-white hover:bg-gray-50 justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Monthly Reports
          </Button>
        </div>
      </Card>
    </div>
  );
}