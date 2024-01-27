'use server'

import { redirect } from "next/navigation"

export default async function navigate(url: string) {
  redirect(url)
}