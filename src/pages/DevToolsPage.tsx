import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, FileText, MessageSquare, Image, CheckSquare, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/layout/Layout";
import {
  useJPUsers,
  useJPPosts,
  useJPComments,
  useJPTodos,
  useJPPhotos,
  type JPPost,
} from "@/hooks/useJsonPlaceholder";

const DevToolsPage = () => {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const { data: users, isLoading: usersLoading } = useJPUsers();
  const { data: posts, isLoading: postsLoading } = useJPPosts(20);
  const { data: comments, isLoading: commentsLoading } = useJPComments(selectedPostId ?? undefined);
  const { data: todos, isLoading: todosLoading } = useJPTodos(20);
  const { data: photos, isLoading: photosLoading } = useJPPhotos(undefined, 24);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Dev Tools</h1>
            <Badge variant="secondary">JSONPlaceholder</Badge>
          </div>
          <p className="text-muted-foreground">
            Mock data from{" "}
            <a
              href="https://jsonplaceholder.typicode.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline inline-flex items-center gap-1"
            >
              jsonplaceholder.typicode.com
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="todos" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-2">
              <Image className="h-4 w-4" />
              Photos
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            {usersLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users?.map((user) => (
                  <Card key={user.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{user.name}</CardTitle>
                      <CardDescription>@{user.username}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p className="text-muted-foreground">{user.email}</p>
                      <p className="text-muted-foreground">{user.phone}</p>
                      <p className="text-muted-foreground">
                        {user.address.city}, {user.address.street}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {user.company.name}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {postsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {posts?.map((post: JPPost) => (
                  <Card key={post.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{post.title}</CardTitle>
                        <Badge variant="secondary">User {post.userId}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{post.body}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedPostId(selectedPostId === post.id ? null : post.id)
                        }
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {selectedPostId === post.id ? "Hide" : "View"} Comments
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            {selectedPostId ? (
              <div className="mb-4">
                <Badge>Showing comments for Post #{selectedPostId}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => setSelectedPostId(null)}
                >
                  Show all
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Showing all comments. Select a post from the Posts tab to filter.
              </p>
            )}
            {commentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {comments?.slice(0, 20).map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <p className="font-medium text-sm text-foreground">{comment.name}</p>
                      <p className="text-xs text-muted-foreground mb-1">{comment.email}</p>
                      <p className="text-sm text-muted-foreground">{comment.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Todos Tab */}
          <TabsContent value="todos">
            {todosLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {todos?.map((todo) => (
                  <Card key={todo.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                            todo.completed
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {todo.completed && (
                            <CheckSquare className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            todo.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {todo.title}
                        </span>
                      </div>
                      <Badge variant={todo.completed ? "default" : "outline"}>
                        {todo.completed ? "Done" : "Pending"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            {photosLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photos?.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.title}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                    <CardContent className="p-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {photo.title}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DevToolsPage;
