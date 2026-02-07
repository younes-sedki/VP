'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import {
  RiChat3Line,
  RiHeart3Line,
  RiHeart3Fill,
  RiMoreFill,
  RiDeleteBinLine,
  RiEditLine,
  RiShareLine,
} from 'react-icons/ri'
import { BadgeCheck, FileText, FileImage, Download, Crown } from 'lucide-react'

import TwitterAvatar from './twitter-avatar'
import { useTweets } from '@/hooks/use-tweets'
import { getLikedTweets, toggleLike, getAdjustedLikeCount } from '@/lib/likes-storage'
import { showToast } from '@/lib/toast-helpers'
import { useRouter } from 'next/navigation'
import { RichTextContent } from './rich-text-content'
import ProfileModal from './profile-modal'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ADMIN_CONFIG } from '@/lib/admin-config'

const ADMIN_DISPLAY_NAME = 'Younes Sedki'
const ADMIN_HANDLE = 'younes-sedki'

interface TwitterPostFeedProps {
  data: {
    id: string
    author: string
    handle: string
    avatar: string
    avatarImage?: string | null
    content: string
    image?: string | null
    images?: string[] | null
    fileType?: 'image' | 'pdf' | 'gif' | null
    fileName?: string | null
    created_at: string
    likes: number
    likedByAdmin?: boolean // Track if admin liked this tweet
    edited?: boolean
    updatedAt?: string
    comments?: { author: string; content: string; timestamp?: string }[]
  }
  currentUser?: {
    username?: string
    id?: string
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isDetailPage?: boolean
}

export default function TwitterPostFeed({
  data,
  currentUser,
  onEdit,
  onDelete,
  isDetailPage = false,
}: TwitterPostFeedProps) {
  const [editPost, setEditPost] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(data.likes || 0)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const router = useRouter()

  // Get images array (support both single image and multiple images for backward compatibility)
  const images = useMemo(() => {
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      return data.images
    }
    if (data.image) {
      return [data.image]
    }
    return []
  }, [data.image, data.images])

  const { deleteTweet } = useTweets()

  // Load likes from server and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Use server likes as the source of truth
    setLikeCount(data.likes || 0)
    
    // Check localStorage for user's like state (for UI feedback)
    const likedTweets = getLikedTweets()
    const isLiked = likedTweets.has(data.id)
    setHasLiked(isLiked)
  }, [data.id, data.likes])


  // Handle ESC key to close image modal and arrow keys for navigation
  useEffect(() => {
    if (!imageModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setImageModalOpen(false)
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setSelectedImageIndex((prev) => (prev + 1) % images.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [imageModalOpen, images.length])

  const createdAt = useMemo(() => {
    if (!data?.created_at) {
      return null
    }
    return formatDistanceToNowStrict(new Date(data.created_at))
  }, [data?.created_at])

  const LikeIcon = hasLiked ? RiHeart3Fill : RiHeart3Line

  // Pick latest admin reply (if any) from comments
  const latestAdminReply = useMemo(() => {
    const comments = data.comments || []
    if (!comments.length) return null
    // Admin replies are saved with ADMIN_CONFIG.name
    return [...comments]
      .filter((c) => c.author && c.author.toLowerCase().includes('younes'))
      .slice(-1)[0] || null
  }, [data.comments])

  const goToPost = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      // Don't navigate if already on detail page
      if (!isDetailPage) {
        router.push(`/tweet/${data?.id}`)
      }
    },
    [data?.id, router, isDetailPage]
  )

  const handleLike = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()

      const newLikedState = !hasLiked
      const action = newLikedState ? 'like' : 'unlike'
      
      // Optimistically update UI
      setHasLiked(newLikedState)
      const optimisticCount = newLikedState ? likeCount + 1 : Math.max(0, likeCount - 1)
      setLikeCount(optimisticCount)
      
      // Update localStorage for user's like state
      toggleLike(data.id)
      
      // Sync with server
      try {
        const response = await fetch(`/api/tweets/${data.id}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to update like')
        }
        
        const result = await response.json()
        if (result.success && typeof result.likes === 'number') {
          // Update with server response
          setLikeCount(result.likes)
        }
      } catch (error) {
        // Revert optimistic update on error
        setHasLiked(!newLikedState)
        setLikeCount(likeCount)
        console.error('Error updating like:', error)
        showToast.error('Failed to update like. Please try again.')
      }
    },
    [hasLiked, data.id, likeCount]
  )

  const handleShare = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      
      if (typeof window === 'undefined') return
      
      const url = `${window.location.origin}/tweet/${data.id}`
      const title = data.author ? `${data.author} on Blog` : 'Tweet'
      const text = data.content ? (data.content.length > 100 ? data.content.substring(0, 97) + '...' : data.content) : title
      
      // Try native share API first (mobile devices)
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url,
          })
          return // Successfully shared
        } catch (err) {
          // User cancelled or share failed, fall through to clipboard
          if ((err as Error).name === 'AbortError') {
            return // User cancelled, don't show error
          }
        }
      }
      
      // Fallback to clipboard
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url)
          showToast.success('Link copied to clipboard!')
        } catch {
          showToast.error('Failed to copy link')
        }
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          showToast.success('Link copied to clipboard!')
        } catch {
          showToast.error('Failed to copy link')
        }
        document.body.removeChild(textArea)
      }
    },
    [data.id, data.author, data.content]
  )

  const handleEdit = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      setEditPost(false)
      onEdit?.(data.id)
    },
    [data.id, onEdit]
  )

  const handleDelete = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      
      if (!confirm('Are you sure you want to delete this post?')) {
        return
      }

      try {
        await deleteTweet(data.id, data.avatar === 'admin')
        showToast.success('Post deleted')
        onDelete?.(data.id)
      } catch (error) {
        showToast.error('Failed to delete post')
      }
      setEditPost(false)
    },
    [data.id, deleteTweet, onDelete]
  )

  const closePostEdit = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as HTMLElement
    const attributeValue = target.getAttribute('editpost-data')
    if (attributeValue === 'editPost') return
    setEditPost(false)
  }

  // Only admin can edit/delete (no user editing)
  const isOwner = false

  return (
    <>
      {/* Profile Modal */}
      {data.avatar === 'admin' && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      {/* Image Modal */}
      {imageModalOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10 bg-black/50 rounded-full p-2 transition-colors"
              onClick={() => setImageModalOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation arrows for multiple images */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 bg-black/50 rounded-full p-2 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 bg-black/50 rounded-full p-2 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => (prev + 1) % images.length)
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 rounded-full px-3 py-1 text-sm z-10">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </>
            )}
            
            <img
              src={images[selectedImageIndex]}
              alt={`Tweet image ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      )}
      
      {editPost && (
        <div
          className="z-40 w-full h-full fixed top-0 left-0"
          onClick={(e) => closePostEdit(e)}
        />
      )}
      <div
        className={`px-3 sm:px-4 py-3 sm:py-4 ${isDetailPage ? '' : 'border-b border-white/[0.06]'} transition-colors duration-200 ${isDetailPage ? '' : 'hover:bg-white/[0.02] cursor-pointer'}`}
        onClick={goToPost}
      >
        <div className="flex items-start gap-2.5 sm:gap-3 relative">
          <div className="flex-shrink-0 mt-0.5">
            <TwitterAvatar
              username={data.handle || data.author}
              avatar={data.avatar}
              avatarImage={data.avatarImage}
              size="small"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <h5
                      className="text-white text-[13px] sm:text-[14px] font-semibold cursor-pointer hover:underline decoration-white/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (data.avatar === 'admin') {
                          setProfileModalOpen(true)
                        }
                      }}
                    >
                      {data.author}
                    </h5>
                    {data.avatar === 'admin' && (
                      <span title="Verified admin">
                        <BadgeCheck 
                          className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 flex-shrink-0" 
                          aria-label="Verified admin"
                        />
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-neutral-800 text-white border border-white/10">
                  {data.avatar === 'admin' ? 'View profile' : 'Visitor'}
                </TooltipContent>
              </Tooltip>
              <span
                className="text-white/40 text-[11px] sm:text-xs cursor-pointer hover:underline decoration-white/20 hidden sm:inline"
                onClick={(e) => {
                  e.stopPropagation()
                  if (data.avatar === 'admin') {
                    setProfileModalOpen(true)
                  }
                }}
              >
                @{data.handle || data.author}
              </span>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-white/40 text-[11px] sm:text-xs">{createdAt}</span>
              {data.edited && (
                <>
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/30 text-[10px] italic">edited</span>
                </>
              )}
            </div>

            <div className="text-white/90 text-[13px] sm:text-[14px] mt-1.5 sm:mt-1 leading-[1.5] sm:leading-[1.55] whitespace-pre-wrap break-words">
              <RichTextContent content={data.content} />
            </div>

            {/* Latest admin reply preview (if any) */}
            {latestAdminReply && (
              <div className="mt-2.5 sm:mt-3 rounded-lg sm:rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] px-3 sm:px-3.5 py-2 sm:py-2.5">
                <div className="flex items-start gap-2 sm:gap-2.5">
                  <div className="flex-shrink-0 hidden sm:block">
                    <TwitterAvatar
                      username={ADMIN_HANDLE}
                      avatar="admin"
                      avatarImage={null}
                      size="small"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 sm:hidden">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <BadgeCheck className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                        </div>
                      </div>
                      <span className="text-[11px] sm:text-[12px] font-semibold text-white">
                        {ADMIN_DISPLAY_NAME}
                      </span>
                      <BadgeCheck 
                        className="w-3 h-3 text-emerald-400 fill-emerald-400 flex-shrink-0 hidden sm:block" 
                        aria-label="Verified admin"
                      />
                      <span className="text-[10px] sm:text-[11px] text-white/30 hidden sm:inline">
                        @{ADMIN_HANDLE}
                      </span>
                      {latestAdminReply.timestamp && (
                        <span className="text-white/20 text-[9px] sm:text-[10px]">
                          · {formatDistanceToNowStrict(new Date(latestAdminReply.timestamp))}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-[12px] text-white/70 whitespace-pre-wrap leading-relaxed break-words">
                      {latestAdminReply.content}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* File attachments (PDF, GIF, Images) */}
            {(images.length > 0 || data.fileType) && (
              <div className="mt-2.5">
                {/* PDF File */}
                {data.fileType === 'pdf' && data.image && (
                  <div 
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(data.image || '', '_blank')
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-red-500/15 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {data.fileName || 'Document.pdf'}
                        </p>
                        <p className="text-white/60 text-xs">PDF Document</p>
                      </div>
                      <Download className="w-5 h-5 text-white/40" />
                    </div>
                  </div>
                )}
                
                {/* GIF File */}
                {data.fileType === 'gif' && data.image && (
                  <div 
                    className="rounded-xl overflow-hidden border border-white/[0.06] cursor-pointer hover:opacity-90 transition-opacity max-w-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(0)
                      setImageModalOpen(true)
                    }}
                  >
                    <div className="relative">
                      <img
                        src={data.image}
                        alt={data.fileName || 'GIF'}
                        className="w-full h-auto max-h-48 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 rounded px-2 py-1">
                        <span className="text-white text-xs font-semibold">GIF</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Regular Images */}
                {images.length > 0 && data.fileType !== 'pdf' && data.fileType !== 'gif' && (
                  <div 
                    className={`rounded-xl overflow-hidden border border-white/[0.06] cursor-pointer hover:opacity-90 transition-opacity ${
                      images.length === 1 
                        ? 'max-w-xs' 
                        : images.length === 2 
                        ? 'max-w-md grid grid-cols-2 gap-1' 
                        : 'max-w-md grid grid-cols-2 gap-1'
                    }`}
                  >
                    {images.slice(0, 4).map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className={`relative ${
                          images.length === 3 && idx === 0 ? 'col-span-2' : ''
                        } ${images.length > 4 && idx === 3 ? 'relative' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImageIndex(idx)
                          setImageModalOpen(true)
                        }}
                      >
                        <img
                          src={img}
                          alt={`Tweet image ${idx + 1}`}
                          className={`w-full h-auto object-cover ${
                            images.length === 1 
                              ? 'max-h-48' 
                              : images.length === 2 
                              ? 'max-h-48' 
                              : 'max-h-32'
                          }`}
                          loading="lazy"
                          decoding="async"
                        />
                        {images.length > 4 && idx === 3 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">+{images.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 sm:gap-5 mt-2.5 sm:mt-3 -ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-1 sm:gap-1.5 text-white/40 cursor-pointer transition-colors duration-200 hover:text-emerald-400 group rounded-full px-2.5 sm:px-2 py-1.5 sm:py-1 -mx-2 -my-1 hover:bg-emerald-400/5 active:bg-emerald-400/10"
                    onClick={handleShare}
                  >
                    <RiShareLine size={16} className="sm:w-[15px] sm:h-[15px] transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-[11px] sm:text-xs">Share</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-neutral-800 text-white border border-white/10">
                  Share this tweet
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors duration-200 group rounded-full px-2.5 sm:px-2 py-1.5 sm:py-1 -mx-2 -my-1 active:scale-95 ${
                        hasLiked 
                          ? 'text-red-400 hover:bg-red-400/5 active:bg-red-400/10' 
                          : 'text-white/40 hover:text-red-400 hover:bg-red-400/5 active:bg-red-400/10'
                      }`}
                      onClick={handleLike}
                    >
                      <LikeIcon
                        size={16}
                        className={`sm:w-[15px] sm:h-[15px] transition-transform duration-200 group-hover:scale-110 ${hasLiked ? 'text-red-400' : ''}`}
                      />
                      <span className="text-[11px] sm:text-xs tabular-nums">{likeCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-neutral-800 text-white border border-white/10">
                    {hasLiked ? 'Unlike this tweet' : 'Like this tweet'}
                  </TooltipContent>
                </Tooltip>
                {/* Admin badge when admin liked a user tweet */}
                {data.avatar === 'user' && data.likedByAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative cursor-help flex items-center justify-center">
                        <Crown 
                          className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" 
                          aria-label="Liked by admin"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-neutral-800 text-white border border-white/10 text-xs">
                      Liked by Younes SEDKI
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
          {isOwner && (
            <>
              <RiMoreFill
                className="absolute right-0 top-0 text-white/60 cursor-pointer hover:text-white transition-colors"
                size={16}
                onClick={(e) => {
                  e.stopPropagation()
                  setEditPost((prev) => !prev)
                }}
              />
              <div
                className={`absolute w-48 right-0 top-5 text-white bg-neutral-900 border border-white/10 z-50 ${
                  editPost ? 'block shadow-lg rounded-lg' : 'hidden'
                }`}
                editpost-data="editPost"
              >
                <div
                  className="rounded hover:bg-white/10 w-full py-1.5 px-2.5 flex items-center gap-1 text-red-400 font-semibold cursor-pointer transition-colors text-xs"
                  onClick={handleDelete}
                >
                  <RiDeleteBinLine size={14} />
                  Delete
                </div>
                <div
                  className="rounded hover:bg-white/10 w-full py-1.5 px-2.5 flex items-center gap-1 text-white font-semibold cursor-pointer transition-colors text-xs"
                  onClick={handleEdit}
                >
                  <RiEditLine size={14} />
                  Edit
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
