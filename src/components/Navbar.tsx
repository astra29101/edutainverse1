
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">EduTainVerse</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/courses">
                  <Button variant="ghost">Browse Courses</Button>
                </Link>
                
                {profile?.role === 'admin' && (
                  <>
                    <Link to="/create-course">
                      <Button variant="ghost">Create Course</Button>
                    </Link>
                    <Link to="/admin">
                      <Button variant="ghost">Admin Panel</Button>
                    </Link>
                  </>
                )}

                {profile?.role === 'learner' && (
                  <>
                    <Link to="/my-courses">
                      <Button variant="ghost">My Courses</Button>
                    </Link>
                    <Link to="/certificates">
                      <Button variant="ghost">Certificates</Button>
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-gray-700">
                    {profile?.full_name || user.email}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {profile?.role}
                  </span>
                </div>

                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
