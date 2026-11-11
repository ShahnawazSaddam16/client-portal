import React from 'react'

export default function ContactInput({open, setOpen}) {
  return (
    <>
    {open && (
    <section className='fixed inset-0 justify-center items-center bg-black/50'>
    </section> 
    )}
    </>
  )
}
