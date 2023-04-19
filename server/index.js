const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors=require('cors');
const nodemailer = require('nodemailer');
const PORT = 6969;



// create reusable transporter object using the default SMTP transport



//firing the email to users who have booked correct email, room number, start time, end time


let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: 'hoteldecent87@gmail.com', // email account from which you want to send the email
        pass: 'doyphmarafhzblda' // password for the email account
    }
});

// setup email data with unicode symbols
//for room booking 
var bookingRoom = {
    from: 'hoteldecent87@gmail.com',
    subject: 'Room Booking Confirmation',
};

//for cancel booking
var cancelRoom = {
    from: 'hoteldecent87@gmail.com',
    subject: 'Room Cancellation',
};


app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

//connection setup
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hotel_management",
});

//getting the details from database
app.get("/init",(req,res)=>{
    console.log("hello");

    let now = new Date();
    console.log(now);
    let nowDT = ""
    for(let c of now.toISOString()){
        if(c === 'T')nowDT += ' ';
        else if(c === '.')break;
        else nowDT += c;
    }
    console.log(nowDT);

    let updateQuery = `update bookings set status='past' where end_time < "${nowDT}" and status not like 'cancelled'`;

    let query = conn.query(updateQuery, (err,resl)=>{
        if(err) throw err;
        let sqlQuery = "SELECT * FROM room_info";
            query = conn.query(sqlQuery, (err, results) => {
            if(err) throw err;
            res.send(apiResponse(results));
        });
    });

    
})

app.delete("/deletebooking/:id",(req,res)=>{
    let sqlQuery = "DELETE FROM bookings WHERE id='"+req.params.id+"'";
    
    let query = conn.query(sqlQuery, (err, results) => {
      if(err) throw err;
        res.send(apiResponse(results));
    });
})

// for sending emails 
app.put("/cancelbooking/:id/:ret/:em/:rn/:rt/:st/:et",(req,res)=>{
    let sqlQuery="UPDATE bookings set status='cancelled' where id='"+req.params.id+"'";
    let query = conn.query(sqlQuery,(err, results) => {
        if(err) throw err;
        console.log(results);
        res.send(apiResponse(results));
        cancelRoom.to = req.params.em;
        cancelRoom.text = `Your Booking for room number ${req.params.rt}${req.params.rn} from ${req.params.st} to ${req.params.et} has been cancelled. Refund Percent : ${req.params.ret}%`;
        transporter.sendMail(cancelRoom, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        });
    });
})

//
app.put("/editBooking/:id",(req,res)=>{
    let sqlQuery = "UPDATE bookings SET ? WHERE id= '"+req.params.id+"'";
  
    let query = conn.query(sqlQuery,req.body, (err, results) => {
      if(err) throw err;
      res.send(apiResponse(results));
    });})

app.get("/booking/:id",(req,res)=>{
    let q = conn.query(`SELECT * FROM bookings where id=${req.params.id}`, (err, results) => {
        if(err) throw err;
        res.json((results));
    });
})

app.get("/bookings/*",(req,res)=>{

    const params = req.params[0].split('/');

    let query = "SELECT * FROM bookings";

    const conditions = [];

    const [room_type, room_number, start_time, end_time,status] = params;

    if (room_type) conditions.push(`room_type = '${room_type}'`);
    if (room_number) conditions.push(`room_number = ${parseInt(room_number)}`);
    if (start_time) conditions.push(`start_time >= '${start_time}'`);
    if (end_time) conditions.push(`end_time <= '${end_time}'`);
    if (status) conditions.push(`status = '${status}'`);

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    console.log(params[0])
    let q = conn.query(query, (err, results) => {
        if(err) throw err;
        res.json((results));
    });
  
});

app.post("/bookroom",(req,res)=>{
    console.log("Book room");
   
    let email=req.body.email;
    let roomType=req.body.roomType;
    let roomNumber=req.body.roomNumber;
    let startTime="";
    let endTime="";
    let total_price=req.body.price;

    startTime = formatDateTime(req.body.startTime);
    endTime = formatDateTime(req.body.endTime);

    startTime += ':00'
   
    endTime += ':00'


    let  obj ={
        email:email,
        room_number: roomNumber,
        room_type:roomType,
        start_time:startTime,
        end_time:endTime,
        price:total_price,
        status:"confirmed"

    }
    console.log(obj);
    
    let sqlQuery =`select count(*) as cnt from bookings where room_type="${roomType}" and room_number=${roomNumber} and (("${startTime}" between start_time and end_time) or ("${endTime}" between start_time and end_time) or (start_time between "${startTime}" and "${endTime}") or (end_time between "${startTime}" and "${endTime}")); `;
  
    let query = conn.query(sqlQuery, (err, results) => {
      if(err) throw err;
      console.log();
      
      if(results[0].cnt>0){
        res.send({msg: "This Room is already booked during this slot!"});
      }else{
        sqlQuery = "INSERT INTO bookings SET ?";
  
        let qr = conn.query(sqlQuery, obj,(error, rslt) => {
            if(error) throw error;
            // send mail with defined transport object
            console.log("trying to send email");
            bookingRoom.to = email;
            bookingRoom.text = `Your Booking is Confirmed. Your Room number is ${roomType}${roomNumber} Your time duration is from ${startTime} to ${endTime}. Have Fun!`;
            transporter.sendMail(bookingRoom, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
            });
            res.send(apiResponse(rslt));
        });
      }
    });

})





conn.connect((err) =>
    console.log(err ? err : "Database Connected Successfully !!")
);

function apiResponse(results){
    return JSON.stringify({"status": 200, "error": null, "response": results});
}

function formatDateTime(dateTime){
    res = "";
    for (let c of dateTime){
        if(c==='T'){
            res+=" ";
        }else{
            res+=c;
        }
    }
    return res;
}

app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
});
