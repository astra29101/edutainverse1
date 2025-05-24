import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'average' | 'advanced';
  modules: Module[];
}

const CreateCourse = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course>({
    id: '',
    title: '',
    description: '',
    category: 'beginner',
    modules: []
  });

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: '',
      description: '',
      videos: []
    };
    setCourse({ ...course, modules: [...course.modules, newModule] });
  };

  const updateModule = (moduleId: string, field: keyof Module, value: any) => {
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId ? { ...module, [field]: value } : module
      )
    });
  };

  const removeModule = (moduleId: string) => {
    setCourse({
      ...course,
      modules: course.modules.filter(module => module.id !== moduleId)
    });
  };

  const addVideo = (moduleId: string) => {
    const newVideo: Video = {
      id: Date.now().toString(),
      title: '',
      youtubeUrl: ''
    };
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? { ...module, videos: [...module.videos, newVideo] }
          : module
      )
    });
  };

  const updateVideo = (moduleId: string, videoId: string, field: keyof Video, value: string) => {
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              videos: module.videos.map(video =>
                video.id === videoId ? { ...video, [field]: value } : video
              )
            }
          : module
      )
    });
  };

  const removeVideo = (moduleId: string, videoId: string) => {
    setCourse({
      ...course,
      modules: course.modules.map(module =>
        module.id === moduleId
          ? { ...module, videos: module.videos.filter(video => video.id !== videoId) }
          : module
      )
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course.title || !course.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would save to a database
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const newCourse = { ...course, id: Date.now().toString() };
    savedCourses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(savedCourses));

    toast({
      title: "Success!",
      description: "Course created successfully",
    });

    navigate('/courses');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'text-green-600';
      case 'average': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-2">Build your course with modules and videos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Basic Info */}
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

          {/* Modules */}
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
              
              {course.modules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No modules added yet. Click "Add Module" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
              Create Course
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
