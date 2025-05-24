
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  videos: Video[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'average' | 'advanced';
  modules: Module[];
}

const CourseView = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          category,
          modules (
            id,
            title,
            description,
            order_index,
            videos (
              id,
              title,
              youtube_url,
              order_index
            )
          )
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Sort modules and videos by order_index
      if (courseData) {
        courseData.modules = courseData.modules.sort((a, b) => a.order_index - b.order_index);
        courseData.modules.forEach(module => {
          module.videos = module.videos.sort((a, b) => a.order_index - b.order_index);
        });
      }

      setCourse(courseData);
      
      // Set first video as default if available
      if (courseData && courseData.modules.length > 0 && courseData.modules[0].videos.length > 0) {
        setSelectedVideo(courseData.modules[0].videos[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
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

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <Link to="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
            </div>
            <Badge className={getCategoryColor(course.category)}>
              {getCategoryLabel(course.category)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  {selectedVideo ? selectedVideo.title : 'Select a video to watch'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVideo ? (
                  <div className="aspect-video">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedVideo.youtube_url)}
                      title={selectedVideo.title}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">Select a video from the course content to start watching</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Content */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.modules.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {course.modules.map((module, moduleIndex) => (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="text-left">
                          <div>
                            <div className="font-medium">
                              Module {moduleIndex + 1}: {module.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {module.videos.length} videos
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {module.description && (
                              <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                            )}
                            {module.videos.map((video, videoIndex) => (
                              <Button
                                key={video.id}
                                variant={selectedVideo?.id === video.id ? "default" : "ghost"}
                                className="w-full justify-start text-left h-auto p-3"
                                onClick={() => setSelectedVideo(video)}
                              >
                                <div>
                                  <div className="flex items-center">
                                    <Play className="mr-2 h-3 w-3" />
                                    <span className="text-sm font-medium">
                                      {videoIndex + 1}. {video.title}
                                    </span>
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="mx-auto h-8 w-8 mb-2" />
                    <p>No modules available in this course yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
