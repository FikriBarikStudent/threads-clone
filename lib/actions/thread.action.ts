'use server'

import { revalidatePath } from "next/cache"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { connectToDatabase } from "../mongoose"

interface createThreadProps {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

interface addCommentToThreadProps {
    threadId: string,
    commentText: string,
    userId: string,
    path: string
}

export async function createThread({
    text,
    author,
    communityId,
    path
} : createThreadProps) {
    try {
        connectToDatabase()

        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        })

        await User.findByIdAndUpdate(author, {
            $push: {
                threads: createdThread._id
            }
        })

        revalidatePath(path)

    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
}

export async function fetchThread(pageNumber = 1, pageSize = 20) {
    try {
        connectToDatabase()

        const skipAmount = (pageNumber - 1) * pageSize

        const threadQuery = Thread.find({ parentId : { $in: [null, undefined]}})
        .sort({createdAt: 'desc'})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User})
        .populate({ 
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: '_id name parentId image'
            }
        })

        const totalThreadCount = await Thread.countDocuments({parentId : { $in: [null, undefined]}})

        const threads = await threadQuery.exec();

        const isNext = totalThreadCount > skipAmount + threads.length

        return { threads, isNext }
        
    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}

export async function fetchThreadById(id: string) {
    try {
        connectToDatabase()
        
        // TODO: populate community
        const thread = await Thread.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: '_id id name image'
        })
        .populate({
            path: 'children',
            populate: [
            {
                path: 'author',
                model: User,
                select: '_id id name parentId image'
            },
            {
                path: 'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: '_id id name parentId image'
                }
            }
            ]
        }).exec()

        return thread
    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}

export async function addCommentToThread({
    threadId,
    commentText,
    userId,
    path
}: addCommentToThreadProps) {
    try {
        connectToDatabase()

        const originalThread = await Thread.findById(threadId)

        if(!originalThread) {
            throw new Error('Thread not found')
        }

        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId
        })

        const savedCommentThread = await commentThread.save()

        originalThread.children.push(savedCommentThread._id)

        await originalThread.save()

        revalidatePath(path)
        
    } catch (error: any) {
        throw new Error(`Error adding comment to thread: ${error.message}`)
    }
}