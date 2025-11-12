import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Alert,
  Chip,
  Avatar,
  ListItemAvatar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import SportsIcon from "@mui/icons-material/Sports";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import PoolIcon from "@mui/icons-material/Pool";
import { useApp } from "../context/AppContext";
import { FeedPost, Friend } from "../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`social-tabpanel-${index}`}
      aria-labelledby={`social-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

// Function to get sport icon based on sport name
function getSportIcon(sport: string) {
  const sportLower = sport?.toLowerCase();
  switch (sportLower) {
    case "basketball":
      return <SportsBasketballIcon />;
    case "soccer":
      return <SportsSoccerIcon />;
    case "football":
      return <SportsFootballIcon />;
    case "tennis":
      return <SportsTennisIcon />;
    case "volleyball":
      return <SportsVolleyballIcon />;
    case "fitness":
    case "gym":
      return <FitnessCenterIcon />;
    case "running":
    case "jogging":
      return <DirectionsRunIcon />;
    case "swimming":
      return <PoolIcon />;
    default:
      return <SportsIcon />;
  }
}

export default function SocialPage() {
  const {
    friends,
    feed,
    profile,
    initialized,
    addFeedPost,
    removeFriend,
    addFriend,
    joinGame,
    games,
    joinedGames,
  } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [feedText, setFeedText] = useState("");
  const [feedPhoto, setFeedPhoto] = useState<File | null>(null);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    friendId: string;
    friendName: string;
  }>({ open: false, friendId: "", friendName: "" });

  if (!initialized) {
    return <Box sx={{ p: 2 }}>Loading...</Box>;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePostFeed = async () => {
    if (!feedText.trim() && !feedPhoto) return;

    let photo: string | undefined;
    if (feedPhoto) {
      const reader = new FileReader();
      photo = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(feedPhoto);
      });
    }

    const post: FeedPost = {
      id: "f" + Date.now(),
      author: profile?.name || "You",
      text: feedText,
      photo,
      time: Date.now(),
    };

    addFeedPost(post);
    setFeedText("");
    setFeedPhoto(null);
  };

  const handleRemoveFriend = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (friend) {
      setConfirmDialog({
        open: true,
        friendId: friendId,
        friendName: friend.name,
      });
    }
  };

  const handleConfirmRemoveFriend = () => {
    removeFriend(confirmDialog.friendId);
    setConfirmDialog({ open: false, friendId: "", friendName: "" });
  };

  const handleCancelRemoveFriend = () => {
    setConfirmDialog({ open: false, friendId: "", friendName: "" });
  };

  const handleAddFriend = () => {
    if (!searchUsername.trim()) {
      setSearchMessage("Please enter a username");
      return;
    }

    // Check if friend already exists
    const existingFriend = friends.find(
      (f) => f.name.toLowerCase() === searchUsername.toLowerCase()
    );
    if (existingFriend) {
      setSearchMessage("This user is already in your friends list");
      return;
    }

    // Simulate finding a user (in real app, this would be an API call)
    const newFriend: Friend = {
      id: "friend_" + Date.now(),
      name: searchUsername,
      mutual: Math.random() > 0.5, // Randomly assign mutual friends
    };

    addFriend(newFriend);
    setSearchMessage(`Successfully added ${searchUsername} as a friend!`);
    setSearchUsername("");
  };

  const handleJoinGame = (gameId: string) => {
    joinGame(gameId);
  };

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Friends" />
          <Tab label="Feed" />
          <Tab label="Find" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          My Friends ({friends.length})
        </Typography>

        {friends.length === 0 ? (
          <Alert severity="info">
            You don't have any friends yet. Go to the Find tab to add some
            friends!
          </Alert>
        ) : (
          <List>
            {friends.map((friend) => (
              <React.Fragment key={friend.id}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFriend(friend.id)}
                      color="error"
                    >
                      <PersonRemoveIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {friend.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.name}
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {friend.mutual && (
                          <Chip
                            label="Mutual Friends"
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Post Composer */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Share with Friends
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Share your sports moment..."
              value={feedText}
              onChange={(e) => setFeedText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFeedPhoto(e.target.files?.[0] || null)}
                style={{ display: "block", marginBottom: 8 }}
              />
              {feedPhoto && (
                <Typography variant="caption">{feedPhoto.name}</Typography>
              )}
            </Box>
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handlePostFeed}
              disabled={!feedText.trim() && !feedPhoto}
            >
              Post
            </Button>
          </CardContent>
        </Card>

        {/* Feed */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Posts
        </Typography>

        {feed.length === 0 ? (
          <Alert severity="info">
            No posts yet. Be the first to share something!
          </Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...feed].reverse().map((post) => {
              const game = post.gameId
                ? games.find((g) => g.id === post.gameId)
                : null;
              return (
                <Card key={post.id}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar sx={{ mr: 2, bgcolor: "secondary.main" }}>
                        {(post.author || "U").charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          {post.author || "Someone"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(post.time).toLocaleString()}
                        </Typography>
                      </Box>
                      {post.sport && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", ml: 2 }}
                        >
                          {getSportIcon(post.sport)}
                        </Box>
                      )}
                    </Box>
                    {post.text && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, mb: post.photo ? 1 : 0 }}
                      >
                        {post.text}
                      </Typography>
                    )}
                    {post.photo && (
                      <Box
                        component="img"
                        src={post.photo}
                        sx={{
                          width: "100%",
                          borderRadius: 1,
                          maxHeight: 300,
                          objectFit: "cover",
                          mb: 1,
                        }}
                        alt="Post image"
                      />
                    )}
                    {post.autoGenerated &&
                      game &&
                      post.text?.includes("hosting") && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant={
                              joinedGames.includes(post.gameId!)
                                ? "contained"
                                : "outlined"
                            }
                            size="small"
                            onClick={() => handleJoinGame(post.gameId!)}
                            startIcon={getSportIcon(post.sport || "")}
                            disabled={joinedGames.includes(post.gameId!)}
                          >
                            {joinedGames.includes(post.gameId!)
                              ? "Already Joined"
                              : "Join Game"}
                          </Button>
                        </Box>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Find New Friends
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Enter a username to send a friend request
            </Typography>

            <TextField
              fullWidth
              placeholder="Enter username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleAddFriend}
              disabled={!searchUsername.trim()}
              fullWidth
            >
              Add Friend
            </Button>

            {searchMessage && (
              <Alert
                severity={
                  searchMessage.includes("Successfully") ? "success" : "warning"
                }
                sx={{ mt: 2 }}
                onClose={() => setSearchMessage("")}
              >
                {searchMessage}
              </Alert>
            )}
          </CardContent>
        </Card>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>Tips for finding friends:</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            • Ask your teammates for their usernames
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Share your username:{" "}
            <strong>{profile?.name || "Your Name"}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Connect with people you meet at games and events
          </Typography>
        </Box>
      </TabPanel>

      {/* Confirmation Dialog for Removing Friends */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelRemoveFriend}
        aria-labelledby="remove-friend-dialog-title"
        aria-describedby="remove-friend-dialog-description"
      >
        <DialogTitle id="remove-friend-dialog-title">Remove Friend</DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-friend-dialog-description">
            Are you sure you want to remove {confirmDialog.friendName} from your
            friends list? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemoveFriend} color="primary">
            Keep Friend
          </Button>
          <Button
            onClick={handleConfirmRemoveFriend}
            color="error"
            variant="contained"
          >
            Remove Friend
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
