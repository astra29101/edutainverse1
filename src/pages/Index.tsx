
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, Video } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to EduTainVerse
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Your Complete Learning Management System - Create, Learn, and Excel
            </p>
            
            {!user ? (
              <div className="space-x-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                {profile?.role === 'admin' ? (
                  <>
                    <Link to="/create-course">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                        Create Course
                      </Button>
                    </Link>
                    <Link to="/courses">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        Manage Courses
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/my-courses">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                        My Dashboard
                      </Button>
                    </Link>
                    <Link to="/courses">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        Browse Courses
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Online Learning
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're an educator creating courses or a learner seeking knowledge, 
            our platform has everything you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Create Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Build comprehensive courses with modules and YouTube video integration.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Video className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Video Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Watch engaging video content and track your learning progress.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Separate interfaces for admins and learners with appropriate permissions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Earn certificates upon course completion and showcase your achievements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role-specific sections */}
      {user && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            {profile?.role === 'admin' ? (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Link to="/create-course">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-8 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Create Course</h3>
                        <p className="text-gray-600">Add new courses with modules and videos</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/courses">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-8 text-center">
                        <Video className="mx-auto h-12 w-12 text-green-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Manage Courses</h3>
                        <p className="text-gray-600">Edit and organize your existing courses</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-8 text-center">
                      <Users className="mx-auto h-12 w-12 text-purple-600 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Analytics</h3>
                      <p className="text-gray-600">Track student progress and engagement</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Continue Your Learning Journey</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Link to="/my-courses">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-8 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">My Courses</h3>
                        <p className="text-gray-600">Continue where you left off</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/courses">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-8 text-center">
                        <Video className="mx-auto h-12 w-12 text-green-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Explore Courses</h3>
                        <p className="text-gray-600">Discover new learning opportunities</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-8 text-center">
                      <Trophy className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
                      <h3 className="text-xl font-bold mb-2">My Certificates</h3>
                      <p className="text-gray-600">View your achievements</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
