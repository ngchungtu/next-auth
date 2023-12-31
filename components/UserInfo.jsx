"use client"
import React, { useEffect, useState } from 'react'
import SignInButton from './SignInButton'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import useSWR from "swr";
import UpdateForm from './UpdateForm'
import moment from 'moment/moment'
import axios from 'axios'
// import Regist from './Regist'
// import Login from './Login'
import Swal from 'sweetalert2'
import Loading from './Loading'

const UserInfo = () => {
    const { status, data: session } = useSession()
    const [activeUpdate, setActiveUpdate] = useState(false)
    const [itemToUpdate, setItemToUpdate] = useState([])
    const [posts, setPosts] = useState([])
    const [attachment, setAttachment] = useState("");
    const [selectedImage, setSelectedImage] = useState();
    // const [active, setActive] = useState(false);
    const author = session?.user?.name

    const fetcher = (...args) => fetch(...args).then((res) => res.json());

    const { data, mutate, error, isLoading } = useSWR(
        `/api/posts?username=${session?.user?.name}`,
        fetcher
    );

    /* #region handle get Posts */
    const getPosts = async () => {
        try {
            const res = await axios.get(`/api/posts`).then((response) => (
                setPosts(response.data)
                // console.log(response.data)
            ))
            return res
        } catch (error) {
            console.log(error);
        }
    }
    /* #endregion */

    useEffect(() => {
        getPosts()
    }, [posts])

    /* #region handle post */

    /* #region select or cancel choose img */
    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const uploadImage = async (e) => {
        const file = e.target.files[0];
        const base64 = await convertBase64(file);
        setAttachment(base64);

        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage();
        setAttachment()
    };
    /* #endregion */

    const handleSubmit = async (e) => {
        e.preventDefault();
        const title = e.target[0].value;
        const content = e.target[1].value;
        try {
            // const data = {
            //     title: title,
            //     content: content,
            //     img: attachment
            // }
            // console.log('post', data);
            await fetch("/api/posts", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    content,
                    image: attachment ? attachment : 'https://images.unsplash.com/photo-1598620617137-2ab990aadd37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZW1wdHl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60',
                    username: session?.user?.name
                }),
            });
            if (title && content) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Đăng bài thành công',
                    showConfirmButton: false,
                    timer: 1500
                })
                mutate()
                e.target.reset()
                setSelectedImage(null)
            } else {
                Swal.fire({
                    position: 'top-end',
                    icon: 'warning',
                    title: 'Vui lòng đăng đủ nội dung',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
            mutate()
        } catch (err) {
            console.log(err);
        }
    };
    /* #endregion */

    const handleUpdate = (id) => {
        const handlerItemUpdate = data.filter((i) => i._id === id)
        setItemToUpdate(handlerItemUpdate)
        setActiveUpdate(true)
    }

    /* #region handle Delete Post */
    const handleDelete = async (id) => {
        setActiveUpdate(false)
        try {
            Swal.fire({
                title: 'Chắc chưa?',
                text: "Xóa nghen!!!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Đổi ý',
                confirmButtonText: 'Ok! Xóa'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire(
                        'Hoàn tất',
                        'Xóa bài thành công',
                        'success'
                    )
                    fetch(`/api/posts/${id}`, {
                        method: "DELETE",
                    })
                }
                mutate()
                getPosts()
            })
            // location.reload()
        } catch (error) {
            console.log(error);
        }
    }
    /* #endregion */

    if (status === 'authenticated') {
        return (
            <div className="flex flex-row justify-between w-full absolute">

                <div className='w-3/5 relative m-10'>
                    <div className='flex flex-row justify-center m-2 sticky'>
                        <Image src="/story.jpg" width={200} height={200} alt="story" />
                    </div>
                    {
                        isLoading
                            ? <Loading />
                            : <div className='absolute h-screen overflow-scroll w-full'>
                                {
                                    posts?.map((item) => (
                                        <div key={item._id} className={item.username === author ? "flex flex-col m-4 p-3 bg-lime-200 rounded" : "flex flex-col m-4 p-3 bg-emerald-100 rounded"}>
                                            <ul>
                                                <li>
                                                    <small>{item.username === author ? "Bạn: " : 'Người khác: '}</small>
                                                    {item.username}
                                                </li>
                                                <li>
                                                    <small>Cảm nghĩ:</small> {item.title}
                                                </li>
                                                <li>
                                                    <small>Câu chuyện:</small> {item.content}
                                                </li>
                                                <li><small>Thời gian: {item.updatedAt}</small></li>
                                                <li>
                                                    <div className="h-2/4 w-2/4 shadow-xl">
                                                        <img className='w-full h-full rounded' src={item.image ? item.image : "empty-img.png"} width={70} height={50} alt="img post" />
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    ))
                                }
                            </div>
                    }
                </div>

                <div className="relative overflow-y-auto w-2/5 m-10 h-96">
                    {/* <div className='shadow-xl p-8 rounded-md flex flex-col gap-3 bg-yellow-200'>
                        <Image className='rounded-full' src={session?.user?.image ? session?.user?.image : "https://cdn.pixabay.com/photo/2014/03/24/17/06/bird-295026_1280.png"} width={60} height={60} alt="user img" />
                        <div>
                            Name: <span className='font-bold'>{session?.user?.name}</span>
                        </div>
                        <div>
                            Email: <span className='font-bold'>{session?.user?.email}</span>
                        </div>
                    </div> */}

                    <form onSubmit={handleSubmit} className='flex flex-col'>
                        <h1 className='text-center m-3 font-bold text-red-400'>Bạn đang nghĩ gì...</h1>
                        <input className='border-solid border-2 border-sky-500 bg-slate-200 p-3 m-2 rounded' type="text" placeholder="Cảm nghĩ..." />
                        <textarea className='border-solid border-2 border-sky-500 bg-slate-200 p-3 m-2 rounded' placeholder="Câu chuyện..." cols="30"></textarea>

                        <div className='mt-2'>
                            <label className='bg-slate-300 m-2 p-2 rounded' htmlFor="inpfile">Chọn ảnh</label>
                            <input
                                className='absolute hidden'
                                id='inpfile'
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    uploadImage(e);
                                }}
                            />
                            {
                                attachment && (
                                    <>
                                        <img src={attachment} className='absolute hidden' alt="profile-img" />
                                        {selectedImage && (
                                            <div>
                                                <img
                                                    className='p-5'
                                                    src={URL.createObjectURL(selectedImage)}
                                                    alt="Thumb"
                                                />
                                                <button onClick={removeSelectedImage}>
                                                    Xóa ảnh này
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )
                            }
                        </div>

                        <button className='bg-teal-600 text-white rounded p-3 mt-3 font-bold'>Chia sẻ</button>
                    </form>
                    {
                        isLoading
                            ? <Loading />
                            : <div className='flex flex-col'>
                                <div className="absolute flex flex-col w-full">
                                    {
                                        data?.map((post) => (
                                            <div key={post._id} className='flex flex-col bg-gray-100 m-1 p-1 rounded'>
                                                <ul className="text-gray-400">
                                                    <li>Tiêu đề: <span className="text-gray-950">{post.title}</span></li>
                                                    <li>Nội dung: <span className="text-gray-950">{post.content}</span></li>
                                                    <li>Ảnh: <div className='w-2/4 h-2/4 shadow-xl'>
                                                        <img className="w-full h-full rounded" src={post.image} alt="img post" />
                                                    </div></li>
                                                    <li>Tác giả: <span className="text-gray-950">{post.username}</span></li>
                                                </ul>
                                                <small>{moment(post.updatedAt).format('HH:MM MMM DD,YYYY')}</small>
                                                <div className="flex flex-row bg-gray-200">
                                                    <button className='p-1 m-1' onClick={() => handleDelete(post._id)}>
                                                        <Image src='https://img.icons8.com/cotton/64/cancel--v4.png' width={30} height={30} alt="delete" />
                                                    </button>
                                                    <button className='p-1 m-1' onClick={() => handleUpdate(post._id)}>
                                                        <Image src='https://img.icons8.com/cotton/64/create-new--v3.png' width={30} height={30} alt="edit" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    {
                                        activeUpdate &&
                                        <div className='m-1 bg-rose-200 rounded'>
                                            <div className='flex flex-row justify-end m-2'>
                                                <button className='m-1' onClick={() => setActiveUpdate(!activeUpdate)}>
                                                    <div className='flex flex-row'>
                                                        <span className='font-bold text-orange-700 m-1'>Đóng</span>
                                                        <Image src='https://img.icons8.com/cotton/64/cancel-2--v2.png' width={30} height={30} alt="cancel" />
                                                    </div>
                                                </button>
                                            </div>
                                            {
                                                itemToUpdate?.map((item) => (
                                                    <UpdateForm item={item} key={item._id} />
                                                ))
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                    }
                </div>
            </div>
        )
    } else {
        return (
            <div className='flex flex-col justify-center'>
                {/* <div className="border-b-2 text-center p-5">
                    {
                        active && <>
                            <Regist />
                            <button onClick={() => setActive(!active)} className='text-center text-emerald-700 font-bold text-sm'>Đăng nhập tài khoản đã có</button>
                        </>
                    }
                    {
                        !active && <>
                            <Login />
                            <button onClick={() => setActive(!active)} className='text-center text-cyan-900 font-bold text-sm'>Tạo tải khoản TẠI ĐÂY nè!</button>
                        </>
                    }
                </div> */}
                <span className='text-center text-orange-600 font-bold m-3'>Đăng nhập Google</span>
                {/* <span className='text-center text-orange-600 font-bold m-3'>Đăng nhập</span> */}
                <div className="flex justify-center">
                    <SignInButton />
                </div>
            </div>
        )
    }
}

export default UserInfo