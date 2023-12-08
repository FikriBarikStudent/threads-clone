'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { usePathname, useRouter } from 'next/navigation'

import { updateUser } from '@/lib/actions/user.action'
import { commentValidation } from '@/lib/validations/thread'
import { addCommentToThread, createThread } from '@/lib/actions/thread.action'
import Image from 'next/image'

interface CommentProps {
    threadId: string,
    currentUserImg: string,
    currentUserId: string
}

export default function Comment({
    threadId,
    currentUserImg,
    currentUserId
}: CommentProps) {

    const pathname = usePathname()
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(commentValidation),
        defaultValues: {
            thread: '',
        }
    })

    const onSubmit = async (values: z.infer<typeof commentValidation>) => {
      await addCommentToThread({
        threadId ,
        commentText: values.thread,
        userId: JSON.parse(currentUserId),
        path: pathname
      })

      form.reset()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
            <FormField
                control={form.control}
                name="thread"
                render={({ field }) => (
                    <FormItem className='flex items-center gap-3 w-full'>
                    <FormLabel>
                        <Image
                            src={currentUserImg}
                            alt='Profile Image'
                            width={48}
                            height={48}
                            className='rounded-full object-cover'
                        />
                    </FormLabel>
                    <FormControl className='border-none bg-transparent'>
                        <Input 
                        type='text'
                        placeholder='Comment...'
                        className='no-focus text-light-1 outline-none'
                        {...field}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
            <Button type='submit' className='comment-form_btn'>
                Post Thread
            </Button>
            </form>
        </Form>
    )
}
