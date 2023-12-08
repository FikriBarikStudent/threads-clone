import { fetchUserPosts } from '@/lib/actions/user.action'
import { redirect } from 'next/navigation'
import React from 'react'
import ThreadCard from '../cards/ThreadCard'
import { fetchCommunityPosts } from '@/lib/actions/community.action'

interface ThreadsTabProps {
    currentUserId: string,
    accountId: string,
    accountType: string
}

export default async function ThreadsTab({
    currentUserId,
    accountId,
    accountType
}: ThreadsTabProps) {
  let result : any

  if (accountType === 'Community') {
    result = await fetchCommunityPosts(accountId)
  } else {
    result = await fetchUserPosts(accountId)
  }


  if (!result) redirect('/')

  return (
    <section className='mt-9 flex flex-col gap-10'>
      {result.threads.map((threadItem: any) => (
        <ThreadCard
        key={threadItem._id}
        id={threadItem._id}
        currentUserId={currentUserId}
        parentId={threadItem.parentId}
        content={threadItem.text}
        author={accountType === 'User' ? {
          name: result.name, image: result.image, id: result.id
        } : { name: threadItem.author.name, image: threadItem.author.image, id: threadItem.author.id }}
        community={threadItem.community}
        createdAt={threadItem.createdAt}
        comments={threadItem.children}
        isComment
      />
      ))}
    </section>
  )
}
