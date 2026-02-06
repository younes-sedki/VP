'use client'

import { useState, useMemo, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Trash2, Repeat2, RotateCcw, BadgeCheck, Edit2, X, Check } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { AuthModal } from '@/components/auth-modal'
import { formatDate, formatNumber } from '@/lib/utils'
import { DynamicTimestamp } from '@/components/dynamic-timestamp'
import { ADMIN_CONFIG, isAdmin } from '@/lib/admin-config'
import { RichTextContent } from '@/components/rich-text-content'
import { TWEET_CONFIG } from '@/lib/config'
import { AnimatePresence, motion } from 'framer-motion'

interface TweetComment {
  id?: string // Optional ID for admin replies
  author: string
  content: string
  timestamp?: string
  avatarImage?: string | null
  replies?: TweetComment[] // Nested replies
}

interface Tweet {
  id: string
  author: string
  handle: string
  avatar: string
  avatarImage?: string | null
  content: string
  image?: string | null
  created_at: string
  updatedAt?: string | null
  edited?: boolean
  likes: number
  comments: TweetComment[]
  retweets?: number
  replies?: number
}

interface TweetItemProps {
  tweet: Tweet
  userName: string
  onLike: (id: string) => void
  onAddComment: (id: string, comment: string) => void
  onReply: (id: string, reply: string) => void
  onReplyToComment?: (tweetId: string, commentIndex: number, reply: string) => void
  onReplyToReply?: (tweetId: string, commentIndex: number, replyIndex: number, reply: string) => void
  onShare: (id: string) => void
  onShareComment?: (tweetId: string, commentIndex: number) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, newContent: string) => Promise<void>
  likedTweets: Set<string>
  tweetLikes: Record<string, number>
  expandedComments: Record<string, boolean>
  onToggleComments: (id: string) => void
  commentInput: Record<string, string>
  onCommentInputChange: (id: string, value: string) => void
  replyInput?: Record<string, string>
  onReplyInputChange?: (key: string, value: string) => void
  replyingToTweet: string | null
  replyingToComment?: { tweetId: string; commentIndex: number } | null
  replyingToReply?: { tweetId: string; commentIndex: number; replyIndex: number } | null
  onToggleReply: (id: string | null) => void
  onToggleCommentReply?: (tweetId: string, commentIndex: number | null) => void
  onToggleReplyReply?: (tweetId: string, commentIndex: number, replyIndex: number | null) => void
  adminReplyText: string
  onAdminReplyTextChange: (value: string) => void
}

const AvatarDisplay = ({ avatar, avatarImage }: { avatar: string; avatarImage?: string | null }) => {
  // Admin avatar: always use configured admin profile picture
  if (avatar === 'admin') {
    return (
      <Image
        src={ADMIN_CONFIG.profilePicture}
        alt={ADMIN_CONFIG.name}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    )
  }

  // If a custom user avatar image is provided, use it
  if (avatarImage) {
    return (
      <Image
        src={avatarImage}
        alt="User avatar"
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        unoptimized={avatarImage.startsWith('data:')}
      />
    )
  }

  // Fallback avatar: colored circle with initial
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
      {(avatar || '?')[0]?.toUpperCase()}
    </div>
  )
}

// Stat animation with twitter-clone algorithm
function StatNumber({ 
  value,
  isActive
}: { 
  value: number
  isActive?: boolean
}) {
  const [displayValue, setDisplayValue] = useState(value)
  
  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  if (value === 0) return null
  
  return (
    <span className={`text-xs transition-all duration-300 ease-out ${
      isActive 
        ? 'text-emerald-400 font-semibold' 
        : 'text-white/60 group-hover:text-white/80'
    }`}>
      {formatNumber(displayValue)}
    </span>
  )
}

// Responsive tweet action button (twitter-clone style)
function TweetAction({
  icon: Icon,
  label,
  count,
  onClick,
  isActive,
  className = '',
  disabled = false,
  hideCountOnMobile = false
}: {
  icon: React.ReactNode
  label: string
  count?: number
  onClick: () => void
  isActive?: boolean
  className?: string
  disabled?: boolean
  hideCountOnMobile?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group flex items-center gap-1.5 px-3 py-2 rounded-full transition-all
        duration-300 ease-out outline-none hover:bg-opacity-10
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={label}
      aria-label={label}
    >
      {Icon}
      {count !== undefined && count > 0 && !hideCountOnMobile && (
        <StatNumber value={count} isActive={isActive} />
      )}
    </button>
  )
}

export function TweetItem({
  tweet,
  userName,
  onLike,
  onAddComment,
  onReply,
  onReplyToComment,
  onReplyToReply,
  onShare,
  onShareComment,
  onDelete,
  onEdit,
  likedTweets,
  tweetLikes,
  expandedComments,
  onToggleComments,
  commentInput,
  onCommentInputChange,
  replyInput = {},
  onReplyInputChange,
  replyingToTweet,
  replyingToComment,
  replyingToReply,
  onToggleReply,
  onToggleCommentReply,
  onToggleReplyReply,
  adminReplyText,
  onAdminReplyTextChange
}: TweetItemProps) {
  const { isLoggedIn } = useAuth()
  const isOwner = userName === tweet.author
  const isAdminUser = isAdmin(userName)
  const isLiked = likedTweets.has(tweet.id)
  const currentLikes = tweetLikes[tweet.id] || tweet.likes
  const [isHovered, setIsHovered] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authAction, setAuthAction] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(tweet.content)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Check if tweet can be edited (within 1 hour)
  const canEdit = useMemo(() => {
    if (!isOwner || !onEdit) return false
    const createdAt = new Date(tweet.created_at)
    const now = new Date()
    const timeSinceCreation = now.getTime() - createdAt.getTime()
    return timeSinceCreation <= TWEET_CONFIG.EDIT_TIME_LIMIT_MS
  }, [isOwner, onEdit, tweet.created_at])

  const handleStartEdit = () => {
    setEditContent(tweet.content)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditContent(tweet.content)
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!onEdit || !editContent.trim()) return
    
    setIsSavingEdit(true)
    try {
      await onEdit(tweet.id, editContent.trim())
      setIsEditing(false)
    } catch (err) {
      // Error handling is done by parent component
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleAddComment = () => {
    if (commentInput[tweet.id]?.trim()) {
      onAddComment(tweet.id, commentInput[tweet.id])
    }
  }

  const handleReply = () => {
    if (adminReplyText.trim()) {
      onReply(tweet.id, adminReplyText)
    }
  }

  const handleLikeClick = () => {
    if (!isLoggedIn) {
      setAuthAction('like tweets')
      setShowAuthModal(true)
      return
    }
    onLike(tweet.id)
  }

  const handleCommentClick = () => {
    if (!isLoggedIn) {
      setAuthAction('comment on tweets')
      setShowAuthModal(true)
      return
    }
    onToggleComments(tweet.id)
  }

  const handleReplyClick = () => {
    if (!isLoggedIn) {
      setAuthAction('reply to tweets')
      setShowAuthModal(true)
      return
    }
    onToggleReply(tweet.id)
  }

  const handleShareClick = () => {
    if (!isLoggedIn) {
      setAuthAction('share tweets')
      setShowAuthModal(true)
      return
    }
    onShare(tweet.id)
  }

  return (
    <>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        actionName={authAction}
      />
      
      <article 
        className="border-b border-white/10 transition-all duration-300 ease-out
                   hover:bg-white/[3%] hover:border-white/20 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      {/* Main Tweet Content */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 transition-colors">
        <div className="flex gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <AvatarDisplay avatar={tweet.avatar} avatarImage={tweet.avatarImage} />
              {tweet.avatar === 'admin' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-neutral-950 rounded-full flex items-center justify-center border-2 border-neutral-950">
                  <BadgeCheck className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                </div>
              )}
            </div>
          </div>

          {/* Tweet Body */}
          <div className="flex-1 min-w-0">
            {/* Header: Name, Handle, Time, Actions */}
            <div className="flex items-start gap-2 flex-wrap sm:flex-nowrap mb-0 relative">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                <div className="font-bold text-white cursor-pointer text-base sm:text-lg leading-tight">
                  {tweet.author}
                </div>
                {tweet.avatar === 'admin' && (
                  <span title="Verified admin">
                    <BadgeCheck 
                      className="w-4 h-4 text-emerald-400 fill-emerald-400 flex-shrink-0" 
                      aria-label="Verified admin"
                    />
                  </span>
                )}
                <div className="text-white/50 truncate text-sm sm:text-base font-medium">
                  @{tweet.handle}
                </div>
                <div className="text-white/40 hidden sm:inline text-sm">·</div>
                <DynamicTimestamp
                  date={tweet.created_at}
                  className="text-white/50 text-sm hover:text-white/70 transition-colors"
                />
                {tweet.edited && (
                  <>
                    <div className="text-white/40 hidden sm:inline text-sm">·</div>
                    <span className="text-white/40 text-sm italic">edited</span>
                  </>
                )}
              </div>

              {/* Edit and Delete buttons for owner - absolutely positioned to prevent layout shift */}
              {isOwner && isHovered && (
                <div className="absolute top-0 right-0 flex items-center gap-1 flex-shrink-0">
                  {canEdit && onEdit && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleStartEdit()
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-white/40 hover:text-emerald-400 
                                hover:bg-emerald-500/10 transition-all duration-300 ease-out"
                      title="Edit tweet"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDelete(tweet.id)
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-white/40 hover:text-red-500 
                                hover:bg-red-500/10 transition-all duration-300 ease-out"
                      title="Delete tweet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Tweet Text - Editable or Rich Text */}
            {isEditing ? (
              <div className="mt-1 space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white/5 border border-emerald-500/30 rounded-lg px-3 py-2 
                            text-[15px] sm:text-base text-white/95 resize-none
                            focus:outline-none focus:border-emerald-500"
                  rows={3}
                  maxLength={TWEET_CONFIG.MAX_LENGTH}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">
                    {editContent.length} / {TWEET_CONFIG.MAX_LENGTH}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-white"
                      disabled={isSavingEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={!editContent.trim() || editContent.trim() === tweet.content || isSavingEdit}
                    >
                      {isSavingEdit ? (
                        'Saving...'
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-0 text-[15px] sm:text-base text-white/95 
                            whitespace-pre-wrap break-words leading-relaxed
                            font-normal tracking-wide">
                <RichTextContent content={tweet.content} />
              </div>
            )}

            {/* Tweet Image - Optimized with Next.js Image */}
            {tweet.image && (
              <div className="mt-4 rounded-xl overflow-hidden border 
                             border-white/10 max-w-full sm:max-w-lg
                             shadow-lg shadow-black/20 hover:border-white/20 transition-all duration-300 ease-out">
                <Image
                  src={tweet.image}
                  alt="Tweet image"
                  width={500}
                  height={300}
                  className="w-full h-auto object-cover"
                  priority={false}
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, 500px"
                />
              </div>
            )}

            {/* Tweet Stats Bar - Responsive */}
            <div className="mt-3 flex gap-0 sm:gap-4 text-white/60 py-2 
                           border-t border-white/10 -mx-3 px-3
                           sm:mx-0 sm:px-0">
              <TweetAction
                icon={<MessageCircle className="w-4 h-4" />}
                label="Reply"
                count={tweet.comments.length}
                onClick={handleCommentClick}
                className="hover:text-blue-400 group text-white/60 
                          hover:bg-blue-500"
              />

              <TweetAction
                icon={<Repeat2 className="w-4 h-4" />}
                label="Retweet"
                count={0}
                onClick={() => {}}
                className="hover:text-emerald-400 group text-white/60 
                          hover:bg-emerald-500"
                disabled={true}
              />

              <TweetAction
                icon={<Heart className={`w-4 h-4 transition-all duration-300 ease-out ${
                  isLiked ? 'fill-emerald-400' : ''
                }`} />}
                label={isLiked ? 'Unlike' : 'Like'}
                count={currentLikes}
                onClick={handleLikeClick}
                isActive={isLiked}
                className={`hover:text-emerald-400 group text-white/60 
                           ${isLiked ? 'text-emerald-400' : ''}`}
              />

              <TweetAction
                icon={<Share2 className="w-4 h-4" />}
                label="Share"
                onClick={handleShareClick}
                className="hover:text-emerald-400 group text-white/60 
                          hover:bg-emerald-500 ml-auto sm:ml-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section - Responsive */}
      <AnimatePresence>
        {expandedComments[tweet.id] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-white/10 
                           bg-white/[1%] space-y-3">
          {/* Display existing comments */}
          {tweet.comments.map((comment, idx) => {
            // Handle both old format (string) and new format (object)
            const commentObj = typeof comment === 'string' 
              ? { author: 'Guest', content: comment }
              : comment
            
            const isCommentFromAdmin = isAdmin(commentObj.author || '')
            
            return (
            <div key={idx} id={`comment-${idx}`} className="space-y-2">
              <div className="flex gap-3 p-2 rounded-lg 
                              hover:bg-white/5 transition-all duration-300 ease-out ml-3">
                {/* Avatar - show admin profile picture if admin, otherwise show user avatar or placeholder */}
                {isCommentFromAdmin ? (
                  <Image
                    src={ADMIN_CONFIG.profilePicture}
                    alt={ADMIN_CONFIG.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : commentObj.avatarImage ? (
                  <Image
                    src={commentObj.avatarImage}
                    alt={commentObj.author || 'User'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 
                                flex items-center justify-center 
                                text-xs font-bold flex-shrink-0">
                    {commentObj.author?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-white text-sm sm:text-base mb-1">
                    <span className="hover:underline cursor-pointer">{commentObj.author || 'Guest'}</span>
                    {isCommentFromAdmin && (
                      <span title="Verified admin">
                        <BadgeCheck 
                          className="w-4 h-4 text-emerald-400 fill-emerald-400 flex-shrink-0" 
                          aria-label="Verified admin"
                        />
                      </span>
                    )}
                    {commentObj.timestamp && (
                      <span className="text-white/40 text-xs ml-1">
                        <DynamicTimestamp date={commentObj.timestamp} />
                      </span>
                    )}
                  </div>
                  <div className="text-white/80 text-sm sm:text-[15px] break-words leading-relaxed">
                    {typeof commentObj === 'string' ? commentObj : commentObj.content}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Share button for comments */}
                  {onShareComment && (
                    <Button
                      onClick={() => onShareComment(tweet.id, idx)}
                      size="sm"
                      variant="ghost"
                      className="text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 flex-shrink-0"
                      title="Share this reply"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {/* User reply button for comments */}
                  {onToggleReplyReply && onReplyInputChange && (
                    <Button
                      onClick={() => {
                        if (replyingToReply?.tweetId === tweet.id && replyingToReply?.commentIndex === idx && replyingToReply?.replyIndex === -1) {
                          onToggleReplyReply(tweet.id, idx, null)
                        } else {
                          onToggleReplyReply(tweet.id, idx, -1) // -1 means replying to the comment itself
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-white/60 hover:text-blue-400 hover:bg-blue-500/10 text-xs"
                      title="Reply to this comment"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {/* Admin reply button for comments */}
                  {isAdminUser && onToggleCommentReply && (
                    <Button
                      onClick={() => onToggleCommentReply(tweet.id, idx)}
                      size="sm"
                      variant="ghost"
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs"
                    >
                      Reply
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Admin reply to comment */}
              {replyingToComment?.tweetId === tweet.id && 
               replyingToComment?.commentIndex === idx && 
               isAdminUser && onToggleCommentReply && (
                <div className="ml-11 mt-2 pt-2 border-t border-white/10
                               bg-white/5 border border-emerald-500/30 
                               rounded-lg p-3">
                  <div className="text-xs text-emerald-400 mb-2 font-bold">
                    ADMIN REPLY TO COMMENT
                  </div>
                  <textarea
                    value={adminReplyText}
                    onChange={(e) => onAdminReplyTextChange(e.target.value)}
                    placeholder="Your admin reply to this comment..."
                    className="w-full bg-transparent border border-white/20 
                              rounded-lg px-3 py-2 text-sm text-white/90
                              outline-none focus:border-emerald-500 
                              resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2 flex-col sm:flex-row">
                    <Button
                      onClick={() => {
                        if (onReplyToComment && adminReplyText.trim()) {
                          onReplyToComment(tweet.id, idx, adminReplyText)
                          onAdminReplyTextChange("")
                          if (onToggleCommentReply) onToggleCommentReply(tweet.id, null)
                        }
                      }}
                      size="sm"
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                    >
                      Send Reply
                    </Button>
                    <Button
                      onClick={() => {
                        onAdminReplyTextChange("")
                        if (onToggleCommentReply) onToggleCommentReply(tweet.id, null)
                      }}
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-white/20 
                                hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Display nested replies */}
              {commentObj.replies && commentObj.replies.length > 0 && (
                <div className="ml-11 mt-2 space-y-2 border-l-2 border-white/10 pl-3">
                  {commentObj.replies.map((reply: TweetComment, replyIdx: number) => {
                    const isReplyFromAdmin = isAdmin(reply.author || '')
                    return (
                      <div key={replyIdx} id={`reply-${idx}-${replyIdx}`} className="flex gap-2 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 ease-out">
                        {/* Avatar */}
                        {isReplyFromAdmin ? (
                          <Image
                            src={ADMIN_CONFIG.profilePicture}
                            alt={ADMIN_CONFIG.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        ) : reply.avatarImage ? (
                          <Image
                            src={reply.avatarImage}
                            alt={reply.author || 'User'}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {reply.author?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold text-white text-xs">
                            <span>{reply.author || 'Guest'}</span>
                            {isReplyFromAdmin && (
                              <span title="Verified admin">
                                <BadgeCheck 
                                  className="w-3 h-3 text-emerald-400 fill-emerald-400 flex-shrink-0" 
                                  aria-label="Verified admin"
                                />
                              </span>
                            )}
                            {isAdminUser && reply.id && (
                              <button
                                type="button"
                                className="text-[10px] font-mono text-white/50 hover:text-white/80"
                                title="Copy reply ID"
                                onClick={() => {
                                  if (typeof window === 'undefined') return
                                  const text = reply.id as string
                                  if (navigator.clipboard?.writeText) {
                                    navigator.clipboard.writeText(text).catch(() => {})
                                  }
                                }}
                              >
                                {reply.id}
                              </button>
                            )}
                            {reply.timestamp && (
                              <span className="text-white/50 text-xs">
                                <DynamicTimestamp date={reply.timestamp} />
                              </span>
                            )}
                          </div>
                          <div className="text-white/70 text-xs break-words">
                            {reply.content}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Share button for replies */}
                          {onShareComment && (
                            <Button
                              onClick={() => onShareComment(tweet.id, idx)}
                              size="sm"
                              variant="ghost"
                              className="text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 flex-shrink-0 p-1"
                              title="Share this reply"
                            >
                              <Share2 className="w-3 h-3" />
                            </Button>
                          )}
                          {/* User reply button for replies */}
                          {onToggleReplyReply && onReplyInputChange && (
                            <Button
                              onClick={() => {
                                if (replyingToReply?.tweetId === tweet.id && replyingToReply?.commentIndex === idx && replyingToReply?.replyIndex === replyIdx) {
                                  onToggleReplyReply(tweet.id, idx, null)
                                } else {
                                  onToggleReplyReply(tweet.id, idx, replyIdx)
                                }
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-white/50 hover:text-blue-400 hover:bg-blue-500/10 text-xs p-1"
                              title="Reply to this reply"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </Button>
                          )}
                          {/* Admin reply button for replies (by ID) */}
                          {isAdminUser && reply.id && onToggleCommentReply && (
                            <Button
                              onClick={() => onToggleCommentReply(tweet.id, idx)}
                              size="sm"
                              variant="ghost"
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs p-1"
                              title={`Admin reply to reply ID: ${reply.id}`}
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* User reply input for comment */}
              {replyingToReply?.tweetId === tweet.id && replyingToReply?.commentIndex === idx && replyingToReply?.replyIndex === -1 && onReplyInputChange && onReplyToReply && (
                <div className="ml-14 mt-1 border-l-2 border-emerald-500/20 pl-2">
                  <div className="text-[10px] text-emerald-400 mb-1 font-semibold">
                    REPLY TO {commentObj.author?.toUpperCase() || 'COMMENT'}
                  </div>
                  <textarea
                    value={replyInput[`${tweet.id}-${idx}--1`] || ''}
                    onChange={(e) => onReplyInputChange(`${tweet.id}-${idx}--1`, e.target.value)}
                    placeholder={`Reply to ${commentObj.author}...`}
                    className="w-full bg-transparent border border-white/10 
                              rounded px-2 py-1 text-xs text-white/80
                              outline-none focus:border-emerald-500/50 
                              resize-none"
                    rows={1}
                    autoFocus
                  />
                  <div className="mt-1 flex gap-1">
                    <Button
                      onClick={() => {
                        const replyText = replyInput[`${tweet.id}-${idx}--1`] || ''
                        if (replyText.trim() && onReplyToReply) {
                          onReplyToReply(tweet.id, idx, -1, replyText)
                          onReplyInputChange(`${tweet.id}-${idx}--1`, '')
                          if (onToggleReplyReply) onToggleReplyReply(tweet.id, idx, null)
                        }
                      }}
                      size="sm"
                      className="rounded bg-emerald-600/80 hover:bg-emerald-700 text-xs h-5 px-1.5"
                    >
                      Reply
                    </Button>
                    <Button
                      onClick={() => {
                        if (onToggleReplyReply) onToggleReplyReply(tweet.id, idx, null)
                        onReplyInputChange(`${tweet.id}-${idx}--1`, '')
                      }}
                      size="sm"
                      variant="outline"
                      className="rounded border-white/10 
                                hover:bg-white/5 text-xs h-5 px-1.5"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* User reply input for nested reply */}
              {replyingToReply?.tweetId === tweet.id && replyingToReply?.commentIndex === idx && replyingToReply?.replyIndex !== null && replyingToReply?.replyIndex !== -1 && onReplyInputChange && onReplyToReply && (
                <div className="ml-14 mt-1 border-l-2 border-emerald-500/20 pl-2">
                  <div className="text-[10px] text-emerald-400 mb-1 font-semibold">
                    REPLY TO {commentObj.replies?.[replyingToReply.replyIndex]?.author?.toUpperCase() || 'REPLY'}
                  </div>
                  <textarea
                    value={replyInput[`${tweet.id}-${idx}-${replyingToReply.replyIndex}`] || ''}
                    onChange={(e) => onReplyInputChange(`${tweet.id}-${idx}-${replyingToReply.replyIndex}`, e.target.value)}
                    placeholder={`Reply to ${commentObj.replies?.[replyingToReply.replyIndex]?.author}...`}
                    className="w-full bg-transparent border border-white/10 
                              rounded px-2 py-1 text-xs text-white/80
                              outline-none focus:border-emerald-500/50 
                              resize-none"
                    rows={1}
                    autoFocus
                  />
                  <div className="mt-1 flex gap-1">
                    <Button
                      onClick={() => {
                        const replyText = replyInput[`${tweet.id}-${idx}-${replyingToReply.replyIndex}`] || ''
                        if (replyText.trim() && onReplyToReply) {
                          onReplyToReply(tweet.id, idx, replyingToReply.replyIndex, replyText)
                          onReplyInputChange(`${tweet.id}-${idx}-${replyingToReply.replyIndex}`, '')
                          if (onToggleReplyReply) onToggleReplyReply(tweet.id, idx, null)
                        }
                      }}
                      size="sm"
                      className="rounded bg-emerald-600/80 hover:bg-emerald-700 text-xs h-5 px-1.5"
                    >
                      Reply
                    </Button>
                    <Button
                      onClick={() => {
                        if (onToggleReplyReply) onToggleReplyReply(tweet.id, idx, null)
                        onReplyInputChange(`${tweet.id}-${idx}-${replyingToReply.replyIndex}`, '')
                      }}
                      size="sm"
                      variant="outline"
                      className="rounded border-white/10 
                                hover:bg-white/5 text-xs h-5 px-1.5"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            )
          })}

          {/* Comment Input Section */}
          {replyingToTweet !== tweet.id && (
            <div className="mt-3 pt-3 border-t border-white/10 
                           flex gap-2 flex-col sm:flex-row">
              <input
                type="text"
                value={commentInput[tweet.id] || ""}
                onChange={(e) => onCommentInputChange(tweet.id, e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-white/90
                          border border-white/20 rounded-lg 
                          px-3 py-2 text-sm outline-none 
                          focus:border-emerald-500 transition-all duration-300 ease-out"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddComment}
                  size="sm"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 
                            flex-1 sm:flex-none"
                >
                  Reply
                </Button>
                {userName === "Younes SEDKI" && (
                  <Button
                    onClick={() => onToggleReply(tweet.id)}
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-emerald-500/50 
                              text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

              {/* Admin Reply Section */}
              {replyingToTweet === tweet.id && isAdminUser && (
            <div className="mt-3 pt-3 border-t border-white/10
                           bg-white/5 border border-emerald-500/30 
                           rounded-lg p-3">
              <div className="text-xs text-emerald-400 mb-2 font-bold">
                ADMIN REPLY
              </div>
              <textarea
                value={adminReplyText}
                onChange={(e) => onAdminReplyTextChange(e.target.value)}
                placeholder="Your admin reply..."
                className="w-full bg-transparent border border-white/20 
                          rounded-lg px-3 py-2 text-sm text-white/90
                          outline-none focus:border-emerald-500 
                          resize-none"
                rows={2}
                autoFocus
              />
              <div className="mt-2 flex gap-2 flex-col sm:flex-row">
                <Button
                  onClick={handleReply}
                  size="sm"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  Send Reply
                </Button>
                <Button
                  onClick={() => {
                    onToggleReply(null)
                    onAdminReplyTextChange("")
                  }}
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-white/20 
                            hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
    </>
  )
}
