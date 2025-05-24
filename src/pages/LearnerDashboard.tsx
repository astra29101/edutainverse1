
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Trophy, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

interface EnrolledCourse {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
  enrolled_at: string;
  completed_at: string | null;
  progress?: number;
  total_videos?: number;
  watched_videos?: number;
}

const LearnerDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
      fetchCertificates();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Calculate progress for each course
      const coursesWithProgress = await Promise.all(
        data?.map(async (enrollment: any) => {
          const { data: videos } = await supabase
            .from('videos')
            .select(`
              id,
              modules!inner(course_id)
            `)
            .eq('modules.course_id', enrollment.course.id);

          const { data: watchedVideos } = await supabase
            .from('video_progress')
            .select('video_id')
            .eq('user_id', user?.id)
            .in('video_id', videos?.map(v => v.id) || []);

          const totalVideos = videos?.length || 0;
          const watchedCount = watchedVideos?.length || 0;
          const progress = totalVideos > 0 ? (watchedCount / totalVideos) * 100 : 0;

          return {
            ...enrollment,
            progress,
            total_videos: totalVideos,
            watched_videos: watchedCount,
          };
        }) || []
      );

      setEnrolledCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses(title)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your progress and continue learning</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledCourses.filter(course => course.completed_at).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledCourses.filter(course => !course.completed_at && course.progress > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Certificates</p>
                  <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
          
          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                <p className="text-gray-600 mb-6">Start learning by enrolling in a course</p>
                <Link to="/courses">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Browse Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {enrollment.course.title}
                      </CardTitle>
                      <Badge className={getCategoryColor(enrollment.course.category)}>
                        {enrollment.course.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {enrollment.course.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(enrollment.progress || 0)}%</span>
                      </div>
                      <Progress value={enrollment.progress || 0} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {enrollment.watched_videos || 0} of {enrollment.total_videos || 0} videos watched
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Link to={`/course/${enrollment.course.id}`}>
                        <Button className="w-full">
                          {enrollment.completed_at ? 'Review Course' : 'Continue Learning'}
                        </Button>
                      </Link>
                      
                      {enrollment.completed_at && (
                        <div className="text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Completed on {new Date(enrollment.completed_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;
