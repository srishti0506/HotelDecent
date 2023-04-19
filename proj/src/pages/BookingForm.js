import React, { useState,useEffect } from "react";
import api from "../api/data"
import './css/BookingForm.css';
import { useNavigate } from "react-router-dom";



function BookingForm() {
  
  const [email, setEmail] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("");
  const [maximumRoom,setmaximumRoom]=useState("");
  const [totalPrice,settotalPrice]=useState(0);
  const [room_config,setRoomConfig] = useState({});
  const navigate = useNavigate();

  

  useEffect(() => {
    console.log("heil1");
    let obj = {};

    api.get("/init").then((response)=>{ //fetching available room configuration.
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
    
  },[]);
    


  const handleSubmit = (event) => { //processing the user input before submission
    event.preventDefault();
    console.log(`Email: ${email}`);
    console.log(`Start Time: ${startTime}`);
    console.log(`End Time: ${endTime}`);
    console.log(`Room Number: ${roomNumber}`);
    console.log(`Room Type: ${roomType}`);

    const room_info={ //assigning the variables
      email:email,
      roomNumber:roomNumber,
      roomType:roomType,
      startTime:startTime,
      endTime:endTime,
      price:totalPrice
    }
    api.post(`/bookroom`,room_info).then((response)=>{ //hiiting the api to book the room
      console.log("hello");
      console.log(response);
      if(response.data.msg !== undefined){
        alert(response.data.msg); //alert of invalid room
        return;
      }else{
        alert("Booked");
      }
      //Clearing all the input fields after submitting the form
      setEmail("");
      setEndTime("");
      setStartTime("");
      setRoomNumber("");
      setRoomType("");
      settotalPrice(0);
      navigate("/home");
      
    }).catch((err)=>{
      console.log("qertyu");
    })
    
  };
  

  const changePrice=(newConfig)=>{
    console.log(newConfig);
    if(newConfig.newType !== "" && newConfig.endTime !== "" && newConfig.newStartTime !== "" ){
      let stDate = new Date(newConfig.newStartTime);
      let enDate = new Date(newConfig.newEndTime);
      const diffInMs = enDate - stDate;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      //Invalid date time: when the starttime is after endtime
      if(diffInHours <= 0){
        alert("Invalid Start or End Time");
        setStartTime("");
        setEndTime("");
      }else{
        if(!isNaN(diffInHours))  //if first date is filled then it is showing me NaN for that we put this condition
        settotalPrice(Math.floor(diffInHours * room_config[`${newConfig.newType}`].pph));
      }
    }
    
  }

  return (
    <div id='bookingmain'>
      <center>
       
      </center>
      <form className= "mainBooking" onSubmit={handleSubmit}>
        <div className="form-row">
        <div className="form-group1 col-md-1.5 mt-3">
        <h1>
          Book a Room
        </h1>
            <label for="email">Email</label>
            <br></br>
            <input className="form-control bk " type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group1 col-md-1.5 mt-3">
            <label for="room_type">Room Type</label>
            <br></br>
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
              <br></br>
              <input className="form-control bk" type="number" value={roomNumber}  min={1} max={maximumRoom} onChange={(e) => setRoomNumber(e.target.value)} />
          </div>
          <div className="form-group1 col-md-1.5 mt-3">
              <label>
                  Start Time
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
                  End Time
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
          <center> <button className=" btn btn-outline-secondary" type="submit">Submit</button></center> 
          </div>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;