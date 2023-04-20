import React, { useEffect, useState } from 'react'
import api from '../api/data'
import { useNavigate } from 'react-router-dom';
import {AiFillCloseCircle} from 'react-icons/ai';
import Navbar from './Navbar';
import './css/Navbar.css';


const Logs = () => {
    const [data,setData] = useState([]);
    const [room_config,setRoomConfig] = useState({});
    const [email, setEmail] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [roomType, setRoomType] = useState("");
    const [status, setStatus] = useState("");
    const [maximumRoom,setmaximumRoom]=useState(1);
    const [totalPrice,settotalPrice]=useState(0);
    const navigate = useNavigate();

    //Checking the refund percentage on cancellation
    const RefundPolicy = (obj) => {
        console.log(obj);
        const now = new Date();
        const start = new Date(obj.start_time);
        const hoursDiff = Math.floor((start - now) / (1000 * 60 * 60)); // convert milliseconds to hours
      
        let refundAmount = "";
        if (hoursDiff > 48) {
          refundAmount = "100%";
        } else if (hoursDiff > 24 && hoursDiff <= 48) {
          refundAmount = "50%";
        } else {
          refundAmount = "0%";
        }

        let rAmt = parseInt(refundAmount);

        if(window.confirm("Are you Sure you want to cancel ? Refund of "+refundAmount+" will be given")){
            api.put(`/cancelbooking/${obj.id}/${rAmt}/${obj.email}/${obj.room_number}/${obj.room_type}/${obj.start_time}/${obj.end_time}`).then((r)=>{
                                getAllBookings();
                            }).catch((e)=>console.log(e))
            
        }

    }


    useEffect(()=>{
       
        let obj = {};
        api.get("/init").then((response)=>{
                console.log("hello") 
                console.log(response.data);
                let data=response.data.response;
                for(let i=0;i<data.length;i++){
                obj[`${data[i].room_type}`]={rooms:data[i].total_rooms,pph:data[i].price};//price per hour:pph
                }
                setRoomConfig(obj);
                console.log(room_config);
            }).catch((err)=>{
                console.log("qertyu");
            });
    getAllBookings();

    },[]);
        //fetching all the booking details
    const getAllBookings = ()=>{
        api.get("/bookings//").then((response)=>{
                setData(response.data);
                console.log(data)
            }).catch((err)=>{
                console.log("qertyu");
            });
    };
    
    const changePrice=(newConfig)=>{
        console.log(newConfig);
        if(newConfig.newType !== "" && newConfig.endTime !== "" && newConfig.newStartTime !== "" ){
          let stDate = new Date(newConfig.newStartTime);
          let enDate = new Date(newConfig.newEndTime);
          const diffInMs = enDate - stDate;
          const diffInHours = diffInMs / (1000 * 60 * 60);
          
          if(diffInHours <= 0){
            alert("Invalid Start or End Time");
          }else{
            if(!isNaN(diffInHours))  //if first date is filled then it is showing me NaN for that we put this condition
            settotalPrice(diffInHours * room_config[`${newConfig.newType}`].pph);
          }
        }
    };

    //Filtering the details using roomtype roomnumber startime endtime and status
    const submit = (e)=>{
        console.log("trying to submit")
        e.preventDefault();
        api.get(`/bookings/${roomType??""}/${roomNumber??""}/${startTime??""}/${endTime??""}/${status??""}`).then((response)=>{
            setData(response.data);
            console.log(data)
        }).catch((err)=>{
            console.log("qwerty");
        });
    };
    
  return (
    <div id='vb'>
        <form className="headingX" onSubmit={(e)=>submit(e)}>
        <hr></hr>
        <div className="form-row log-class">
            <div className="form-group col-md-1.5">
                <label htmlFor="room_type">Room Type:</label>
                <select className="form-control" id="room_type" name="room_type" type="select" value={roomType}   onChange={(e) => {
                    setRoomType(e.target.value);

                    let changeConfig = {
                        newType: e.target.value,
                        newStartTime : startTime,
                        newEndTime:endTime
                    }
                    changePrice(changeConfig);
                    if(e.target.value==='A')setmaximumRoom(room_config.A.rooms);
                    else if(e.target.value==='B')setmaximumRoom(room_config.B.rooms);
                    else setmaximumRoom(room_config.C.rooms);
                    }} >
                    <option value="">Please Select a room type</option>
                    <option value="A">A room</option>
                    <option value="B">B room</option>
                    <option value="C">C room</option>
                </select>
            </div>

            <div className="form-group col-md-1.5">
                <label htmlFor="room_no">Room Number</label>
                <input className="form-control" type="number" value={roomNumber}  min={1} max={maximumRoom} onChange={(e) => setRoomNumber(e.target.value)} />
            </div>
            <div className="form-group col-md-1.5">
                <label>
                    Start Time:
                    <input className="form-control" type="datetime-local"   value={startTime} onChange={(e) => {
                    setStartTime(e.target.value);
                    let changeConfig = {
                        newType: roomType,
                        newStartTime : e.target.value,
                        newEndTime:endTime
                    }
                    changePrice(changeConfig);

                    }} />
                </label>
            </div>
            <div className="form-group col-md-1.5">
                <label>
                    End Time:
                    <input className="form-control" type="datetime-local"   value={endTime} onChange={(e) => {
                    setEndTime(e.target.value);
                    let changeConfig = {
                        newType: roomType,
                        newStartTime : startTime,
                        newEndTime:e.target.value
                    }
                    changePrice(changeConfig);
                    }} />
                </label>
            </div>
            <div className="form-group col-md-1.5">
                <label htmlFor="status">Status</label>
                <select className="form-control" id="status" name="status" onChange={(e)=>setStatus(e.target.value)}>
                    <option value="">-- Select Status --</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="past">Past</option>
                </select>
            </div>
            <div className="form-group col-md-1.5">
                <button type="submit" className="btn btn-primary mt-4">Filter</button> &nbsp;
                <button type="button" className="btn btn-warning text-white mt-4" 
                    onClick={()=>getAllBookings()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                        className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                        <path
                            d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                    </svg>
                </button>
            </div>
        </div>
    </form>
    <br></br><hr></hr>
    <form id='vbform' action="/" method="">
        <table id='vbtable' className="table table-hover px-7">
            <thead className="thead-dark">
                <tr>
                    <th>Sr No.</th>
                    <th>Email</th>
                    <th>Room Type</th>
                    <th>Room Number</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Options</th>
                </tr>
                
            </thead>
            <tbody>
            {
                data && data.map((e,idx)=>(
                    <tr key={idx}>
                        <td>{idx+1}</td>
                        <td>{e.email}</td>
                        <td>{e.room_type}</td>
                        <td>{e.room_number}</td>
                        <td>{new Date(e.start_time).toLocaleDateString()+" "+new Date(e.start_time).toTimeString()}</td>
                        <td>{new Date(e.end_time).toLocaleDateString()+" "+new Date(e.end_time).toTimeString()}</td>
                        <td>{e.status}</td>
                        <td>{e.price}</td>
                        <td>
                            <button disabled={!(e.status==='confirmed')} type="button" className="btn btn-success" onClick={()=>navigate(`/edit/${e.id}`)}>
                                Edit
                            </button>
                        </td>

                        <td>
                            <button disabled={!(e.status==='confirmed')} type="button" className="btn btn-primary" onClick={()=>RefundPolicy(e)}>
                                Cancel
                            </button>
                        </td>


                        <td>
                        <button type="button" className="btn btn-danger" onClick={()=>{
                            if(window.confirm("Do you want to delete this record")) {
                                api.delete(`/deletebooking/${e.id}`).then((r)=>{
                                getAllBookings();
                            }).catch((e)=>console.log(e))
                            }

                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                            </svg>
                        </button>
                        </td>
                        
                        
                      
                    </tr>
                ))
            }
            </tbody>
        </table>
    </form>
    </div>
    );
}

export default Logs;