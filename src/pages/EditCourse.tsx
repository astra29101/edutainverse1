import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  isNew?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  isNew?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'average' | 'advanced';
  modules: Module[];
}

const EditCourse = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (courseData) {
        // Sort modules and videos by order_index
        courseData.modules = courseData.modules.sort((a, b) => a.order_index - b.order_index);
        courseData.modules.forEach(module => {
          module.videos = module.videos.sort((a, b) => a.order_index - b.order_index);
        });

        // Transform data to match component interface
        const transformedCourse: Course = {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          modules: courseData.modules.map(module => ({
            id: module.id,
            title: module.title,
            description: module.description || '',
            videos: module.videos.map(video => ({
              id: video.id,
              title: video.title,
              youtubeUrl: video.youtube_url
            }))
          }))
        };

        setCourse(transformedCourse);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to load course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = () => {
    if (!course) return;
    const newModule: Module = {
      id: Date.now().toString(),
      title: '',
      description: '',
      videos: [],
      isNew: true
    };
    setCourse({ ...course, modules: [...course.modules, newModule] });
  };

  const updateModule = (moduleId: string, field: keyof Module, value: any) => {
    if (!course) return;
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId ? { ...module, [field]: value } : module
      )
    });
  };

  const removeModule = (moduleId: string) => {
    if (!course) return;
    setCourse({
      ...course,
      modules: course.modules.filter(module => module.id !== moduleId)
    });
  };

  const addVideo = (moduleId: string) => {
    if (!course) return;
    setCourse({
      ...course,
      modules: course.modules.map(module => {
        if (module.id === moduleId) {
          const newVideo: Video = {
            id: Date.now().toString(),
            title: '',
            youtubeUrl: '',
            isNew: true
          };
          return { ...module, videos: [...module.videos, newVideo] };
        }
        return module;
      })
    });
  };

  const updateVideo = (moduleId: string, videoId: string, field: keyof Video, value: string) => {
    if (!course) return;
    setCourse({
      ...course,
      modules: course.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            videos: module.videos.map(video =>
              video.id === videoId ? { ...video, [field]: value } : video
            )
          };
        }
        return module;
      })
    });
  };

  const removeVideo = (moduleId: string, videoId: string) => {
    if (!course) return;
    setCourse({
      ...course,
      modules: course.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            videos: module.videos.filter(video => video.id !== videoId)
          };
        }
        return module;
      })
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course || !course.title || !course.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the course
      const { error: courseError } = await supabase
        .from('courses')
        .update({
          title: course.title,
          description: course.description,
          category: course.category
        })
        .eq('id', course.id);

      if (courseError) throw courseError;

      // Handle modules and videos updates
      const existingModuleIds = course.modules.filter(m => !m.isNew).map(m => m.id);
      
      // Delete modules that were removed
      if (existingModuleIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('modules')
          .delete()
          .eq('course_id', course.id)
          .not('id', 'in', `(${existingModuleIds.map(id => `'${id}'`).join(',')})`);

        if (deleteError) throw deleteError;
      }

      // Update/insert modules and videos
      for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
        const module = course.modules[moduleIndex];
        
        if (!module.title) continue;
        
        let moduleId = module.id;
        
        if (module.isNew) {
          // Insert new module
          const { data: moduleData, error: moduleError } = await supabase
            .from('modules')
            .insert({
              course_id: course.id,
              title: module.title,
              description: module.description || '',
              order_index: moduleIndex
            })
            .select()
            .single();

          if (moduleError) throw moduleError;
          moduleId = moduleData.id;
        } else {
          // Update existing module
          const { error: moduleError } = await supabase
            .from('modules')
            .update({
              title: module.title,
              description: module.description || '',
              order_index: moduleIndex
            })
            .eq('id', module.id);

          if (moduleError) throw moduleError;
        }

        // Handle videos for this module
        const existingVideoIds = module.videos.filter(v => !v.isNew).map(v => v.id);
        
        // Delete videos that were removed
        if (existingVideoIds.length > 0) {
          const { error: deleteVideoError } = await supabase
            .from('videos')
            .delete()
            .eq('module_id', moduleId)
            .not('id', 'in', `(${existingVideoIds.map(id => `'${id}'`).join(',')})`);

          if (deleteVideoError) throw deleteVideoError;
        }

        // Update/insert videos
        for (let videoIndex = 0; videoIndex < module.videos.length; videoIndex++) {
          const video = module.videos[videoIndex];
          
          if (!video.title || !video.youtubeUrl) continue;
          
          if (video.isNew) {
            // Insert new video
            const { error: videoError } = await supabase
              .from('videos')
              .insert({
                module_id: moduleId,
                title: video.title,
                youtube_url: video.youtubeUrl,
                order_index: videoIndex
              });

            if (videoError) throw videoError;
          } else {
            // Update existing video
            const { error: videoError } = await supabase
              .from('videos')
              .update({
                title: video.title,
                youtube_url: video.youtubeUrl,
                order_index: videoIndex
              })
              .eq('id', video.id);

            if (videoError) throw videoError;
          }
        }
      }

      toast({
        title: "Success!",
        description: "Course updated successfully",
      });

      navigate('/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/courses" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-2">Update your course content and structure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Basic Info - same as CreateCourse */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Describe what students will learn"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Difficulty Level</Label>
                <Select
                  value={course.category}
                  onValueChange={(value: 'beginner' | 'average' | 'advanced') =>
                    setCourse({ ...course, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Modules section - same structure as CreateCourse but with existing data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Course Modules</CardTitle>
                <Button type="button" onClick={addModule} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Module {moduleIndex + 1}</h3>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Module Title</Label>
                      <Input
                        value={module.title}
                        onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                        placeholder="Enter module title"
                      />
                    </div>
                    <div>
                      <Label>Module Description</Label>
                      <Textarea
                        value={module.description}
                        onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                        placeholder="Describe this module"
                        rows={2}
                      />
                    </div>

                    {/* Videos */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-medium">Videos</Label>
                        <Button
                          type="button"
                          onClick={() => addVideo(module.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add Video
                        </Button>
                      </div>
                      
                      {module.videos.map((video, videoIndex) => (
                        <div key={video.id} className="bg-white p-3 rounded border mb-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Video {videoIndex + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVideo(module.id, video.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Video Title</Label>
                              <Input
                                value={video.title}
                                onChange={(e) => updateVideo(module.id, video.id, 'title', e.target.value)}
                                placeholder="Enter video title"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">YouTube URL</Label>
                              <Input
                                value={video.youtubeUrl}
                                onChange={(e) => updateVideo(module.id, video.id, 'youtubeUrl', e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {course?.modules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No modules added yet. Click "Add Module" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Course"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/courses')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
