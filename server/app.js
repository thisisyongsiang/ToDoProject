const express=require('express');
const bodyParser = require('body-parser');
const mongoose=require('mongoose');
const Task =require('./models/task');
const app=express();
const { v4: uuidv4 } = require('uuid');

mongoose.connect("mongodb+srv://user:user@yscluster.j8iq2.mongodb.net/ToDo?retryWrites=true&w=majority")
.then(()=>{
  console.log('connected to mongodb');
})
.catch(()=>{
  console.log('connection has a problem');
})

//adding bodyparser to express middleware to parse json data
app.use(bodyParser.json());

//add header to resolve cors problem
app.use((req,res,next)=>{
  //allow all domain to access the server
  res.setHeader('Access-Control-Allow-Origin','*');
  //allow non default domains with certain headers specified
  res.setHeader('Access-Control-Allow-Headers',
  'Origin,X-Request-With,Content-Type,Accept');
  //allow only certain http words to send request.
  //options is important as it is an implicit request that is sent
  res.setHeader('Access-Control-Allow-Methods',
  'GET,POST,PATCH,DELETE,OPTIONS,PUT',)
  next();
})

//post tasks to database
app.post('/',(req,res,next)=>{
  id=uuidv4();
  const task=new Task({
    title:req.body.title,
    dateTime:req.body.dateTime?req.body.dateTime:null,
    completed:req.body.completed?req.body.completed:false,
    url:'http://'+req.get('host')+'/' + id,
    id:id,
    order:req.body.order?req.body.order:null
  });
  task.save().then(result=>{
    res.status(200).json(result);
  });
});

//get tasks on database
app.get('/',(req,res,next)=>{
  Task.find()
  .then(result=>{
    res.status(200).json(result);
  })
})

//get specific task on database
app.get('/:id',(req,res,next)=>{

  console.log('getone');
  Task.findOne({id:req.params.id})
  .then(result=>{
    console.log(result);
    res.status(200).json(result);
  })
})
//delete tasks on database
//:id is a dynamic path segment to identify what to delete
app.delete('/:id',(req,res,next)=>{
  Task.deleteOne({id:req.params.id})
  .then(()=>{
    res.status(200).json({message:"task Deleted"});
  });

})

//delete only completed Task
app.delete('/task/completed',(req,res,next)=>{
  Task.deleteMany({completed:true})
  .then(()=>{
    console.log('deleting');
    res.status(200).json({messgae:"cleared completed tasks"});
  })
})

//delete ALL tasks
app.delete('/',(req,res,next)=>{
  Task.deleteMany()
  .then(()=>{
    res.status(200).json({messgae:"cleared completed tasks"});
  })
})

//patch to database to update all completion status
app.patch('/completed',(req,res,next)=>{
  allComplete=req.body.allComplete;
  Task.updateMany({completed:!allComplete},{completed:allComplete})
  .then((result)=>{
    res.status(200).json({message:"many Task Updated"});
  });

})

app.patch('/:id',(req,res,next)=>{
  const updates=req.body;

  Task.findOneAndUpdate({id:req.params.id},updates,{new:true},(err,doc)=>{
        res.status(200).json(doc);
    })
})
module.exports=app;
