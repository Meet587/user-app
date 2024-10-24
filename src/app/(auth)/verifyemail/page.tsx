"use client"
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

const varifyPage = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const verifyMail = async () => {
        try {
            const response = await axios.post('/api/auth/verify-email', { token })
        } catch (error: any) {
            console.log(error.response.data)
        }
    }
    useEffect(() => {
        verifyMail()
    }, [])
    return (
        <div>varifyPage</div>
    )
}

export default varifyPage