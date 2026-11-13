import React from 'react'

export default function QuotePopUp({open, setOpen}) {
  return (
    <>
    {open && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
            hello
        </div>
    )}
    </>
  )
}
