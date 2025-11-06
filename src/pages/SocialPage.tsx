import React, { useState } from 'react'
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  Button, 
  Typography,
  Card,
  CardContent
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useApp } from '../context/AppContext'
import { FeedPost } from '../types'

export default function SocialPage() {
  const { friends, feed, profile, initialized, addFeedPost } = useApp()
  const [feedText, setFeedText] = useState('')
  const [feedPhoto, setFeedPhoto] = useState<File | null>(null)

  if (!initialized) {
    return <Box sx={{ p: 2 }}>Loading...</Box>
  }

  const handlePostFeed = async () => {
    if (!feedText.trim() && !feedPhoto) return

    let photo: string | undefined
    if (feedPhoto) {
      const reader = new FileReader()
      photo = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(feedPhoto)
      })
    }

    const post: FeedPost = {
      id: 'f' + Date.now(),
      author: profile?.name || 'You',
      text: feedText,
      photo,
      time: Date.now()
    }

    addFeedPost(post)
    setFeedText('')
    setFeedPhoto(null)
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Friends Section */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Friends
      </Typography>
      <List sx={{ mb: 4 }}>
        {friends.map(friend => (
          <ListItem key={friend.id}>
            <ListItemText primary={friend.name} />
          </ListItem>
        ))}
      </List>

      {/* Post Composer */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
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
              style={{ display: 'block', marginBottom: 8 }}
            />
            {feedPhoto && <Typography variant="caption">{feedPhoto.name}</Typography>}
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
        Feed
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[...feed].reverse().map(post => (
          <Card key={post.id}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {post.author || 'Someone'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(post.time).toLocaleString()}
              </Typography>
              {post.text && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {post.text}
                </Typography>
              )}
              {post.photo && (
                <Box
                  component="img"
                  src={post.photo}
                  sx={{ width: '100%', borderRadius: 1, mt: 1, maxHeight: 300, objectFit: 'cover' }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
