import React from 'react'

const NewsLetterBox = () => {

    const onSubmitHandler = (e) => {
        e.preventDefault();
    }

    return (
        <div className='text-center'>
            <p className='text-2xl font-medium text-gray-800'>
                Subscribe now & get 20% off
            </p>
            <p className='text-gray-400 mt-3'>
            Subscribe now for the latest updates, exclusive deals, and limited-time offers. Enjoy a personalized shopping experience — your 20% discount is just the beginning!
            </p>
            <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
                <input className='w-full sm:flex-1 outline-none' type="email" placeholder='Enter your email' />
                <button className='bg-black text-white text-xs px-10 py-4' type='submit'>Subscribe</button>
            </form>
        </div>
    )
}

export default NewsLetterBox
