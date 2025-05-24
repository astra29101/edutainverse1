import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Video, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'average' | 'advanced';
  modules: { id: string; videos: { id: string }[] }[];
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          category,
          modules (
            id,
            videos (
              id
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    setDeletingCourseId(courseId);
    
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Course deleted successfully",
      });

      // Remove the course from the local state
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingCourseId(null);
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'beginner': return 'Beginner';
      case 'average': return 'Average';
      case 'advanced': return 'Advanced';
      default: return category;
    }
  };

  const getTotalVideos = (course: Course) => {
    return course.modules.reduce((total, module) => total + module.videos.length, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
          <p className="text-gray-600 mt-2">Discover and explore available courses</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first course.</p>
            <Link to="/create-course">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Your First Course
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <Badge className={getCategoryColor(course.category)}>
                      {getCategoryLabel(course.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <BookOpen className="mr-1 h-4 w-4" />
                      {course.modules.length} modules
                    </span>
                    <span className="flex items-center">
                      <Video className="mr-1 h-4 w-4" />
                      {getTotalVideos(course)} videos
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Link to={`/course/${course.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View Course
                      </Button>
                    </Link>
                    
                    <div className="flex gap-2">
                      <Link to={`/edit-course/${course.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            disabled={deletingCourseId === course.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingCourseId === course.id ? "Deleting..." : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the course
                              "{course.title}" and all its modules and videos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCourse(course.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Course
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
