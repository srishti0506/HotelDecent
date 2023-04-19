import React, { useEffect, useState } from 'react'
import api from '../api/data'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './css/BookingForm.css';

const Edit = () => {
    const {id} = useParams();
    const [data,setData] = useState([]);
    const [email, setEmail] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [roomType, setRoomType] = useState("");
    const [maximumRoom,setmaximumRoom]=useState(1);
    const [totalPrice,settotalPrice]=useState(0);
    const [room_config,setRoomConfig] = useState({});
    const navigate = useNavigate();

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

            api.get(`/booking/${id}`).then((res)=>{
                setData(res.data[0]);
                setEmail(res.data[0].email);
                setRoomNumber(res.data[0].room_number);
                setRoomType(res.data[0].room_type);
                setStartTime(res.data[0].start_time.substring(0,res.data[0].start_time.length-1));
                setEndTime(res.data[0].end_time.substring(0,res.data[0].end_time.length-1));
                settotalPrice(res.data[0].price);
                if(res.data[0].room_type==='A')setmaximumRoom(obj.A.rooms);
                else if(res.data[0].room_type==='B')setmaximumRoom(obj.B.rooms);
                else setmaximumRoom(obj.C.rooms);
            });

            }).catch((err)=>{
                console.log("qertyu");
            });
    },[]);


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
          settotalPrice(Math.floor(diffInHours * room_config[`${newConfig.newType}`].pph));
        }
      }  
    }

    const handleSubmit = (event) => {
      event.preventDefault();
      console.log(`Email: ${email}`);
      console.log(`Start Time: ${startTime}`);
      console.log(`End Time: ${endTime}`);
      console.log(`Room Number: ${roomNumber}`);
      console.log(`Room Type: ${roomType}`);

      const data={
          email:email,
          room_number:roomNumber,
          room_type:roomType,
          start_time:startTime,
          end_time:endTime,
          price:totalPrice

        }

      api.put(`/editBooking/${id}`,data).then((r)=>{
          console.log(r)
      }).catch((err)=>console.log(err));

      navigate("/");
  }

  return (
    <div>
     
        {console.log(data)}
        <form className= "mainBooking" onSubmit={handleSubmit}>
        <div className="form-row">
        <div className="form-group1 col-md-1.5 mt-3">
        
        <h1>
          Edit User Details
        </h1>
     
            <label for="email">Email</label>
            <input className="form-control bk" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group1 col-md-1.5 mt-3">
            <label for="room_type">Room Type:</label>
            <select className="form-control bk" id="room_type" name="room_type" type="select" value={roomType}   onChange={(e) => {
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

          <div className="form-group1 col-md-1.5 mt-3">
              <label for="room_no">Room Number</label>
              <input className="form-control bk" type="number" value={roomNumber}  min={1} max={maximumRoom} onChange={(e) => setRoomNumber(e.target.value)} />
          </div>
          <div className="form-group1 col-md-1.5 mt-3">
              <label>
                  Start Time:
                  <input className="form-control bk" type="datetime-local"   value={startTime} onChange={(e) => {
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
          <div className="form-group1 col-md-1.5 mt-3">
              <label>
                  End Time:
                  <input className="form-control bk" type="datetime-local"   value={endTime} onChange={(e) => {
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
          <div className="form-group1 col-md-1.5 mt-3">
            <label for="total-price">Total Price</label>
            <input className="form-control bk" type="text" value={totalPrice} disabled/>
          </div>
          <div className="form-group1 col-md-1.5 mt-3">
           <center> <button className="btn btn-outline-secondary" type="submit">Submit</button></center>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Edit