const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require('fs');
const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000' // Replace with your frontend URL
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the CRUD app!");
});



app.get('/family-tree', (req, res) => {
  fs.readFile('family_tree.json', 'utf-8', (err, data) => {
    if (err) throw err;

    let familyTree = JSON.parse(data);

    // Search for the node with the given name
    function search(node, name) {
      if (node.name === name) {
        return node;
      }
      for (let i = 0; i < node.children.length; i++) {
        let result = search(node.children[i], name);
        if (result) {
          return result;
        }
      }
      return null;
    } 
    // If the name is provided in the query parameters, search for the node with the given name
    if (req.query.name) {
      let result = search(familyTree, req.query.name);
      if (result) {
        res.send(result);
      } else {
        res.status(404).send({ status: 'Not Found' });
      }
    } else {
      res.send(familyTree);
    }
  });
});

app.post('/add-child', (req, res) => {
  // Read the JSON file
  fs.readFile('family_tree.json', 'utf-8', (err, data) => {
    if (err) throw err;

    // Parse the JSON data
    let familyTree = JSON.parse(data);
    console.log(data);
    // Recursively search for the node with the specified id
    function search(node) {
      if (node.attributes.id === req.body.parentId) {
        node.children.push(req.body.child);
        return true;
      }
      for (let i = 0; i < node.children.length; i++) {
        if (search(node.children[i])) return true;
      }
      return false;
    }
    if( search(familyTree)){
      // Write the updated family tree back to the file
     fs.writeFile('family_tree.json', JSON.stringify(familyTree), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      res.send({ status: 'success' });
    });
    }else{
      res.status(500).send({ status: 'Given Id Not Found' });
    }
  });
});

app.delete('/delete-child/:childId', (req, res) => {
 // Read the JSON file
 console.log(req.params.childId);
 fs.readFile('family_tree.json', 'utf-8', (err, data) => {
   if (err) throw err;

   // Parse the JSON data
   let familyTree = JSON.parse(data);
   console.log(familyTree);
   // Recursively search for the node with the specified parentId and childId
   function search(node) {
     for (let i = 0; i < node.children.length; i++) {
       if (node.children[i].attributes.id === req.params.childId ) {
         node.children.splice(i, 1);
         return true;
       }
       if (search(node.children[i])) {return true;} 
     }
     return false;
   }
  if( search(familyTree)){
    // Write the updated family tree back to the file
   fs.writeFile('family_tree.json', JSON.stringify(familyTree), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
    res.send({ status: 'success' });
  });
  }else{
    res.status(500).send({ status: 'Given Id Not Found' });
  }
 });
});

app.put('/edit-node/:id', (req, res) => {
  
 console.log(req.body);
 // Read the JSON file
 fs.readFile('family_tree.json', 'utf-8', (err, data) => {
   if (err) throw err;

   // Parse the JSON data
   let familyTree = JSON.parse(data);

   // Recursively search for the node with the specified id
   function search(node) {
     if (node.attributes.id === req.params.id) {
       node.name = req.body.name;
       return true;
     }
     for (let i = 0; i < node.children.length; i++) {
       if (search(node.children[i])) return true;
     }
     return false;
   }
  if( search(familyTree)){
 // Write the updated family tree back to the file
 fs.writeFile('family_tree.json', JSON.stringify(familyTree), (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
  res.send({ status: 'success' });
});
  }else{
    res.status(500).send({ status: 'Given Id Not Found' });
  }
 });
});

//admin login controller
app.post('/admin/login', (req, res) => {
  // Read the JSON file
  var userName = null;
  var password = null;
  if(req.body != null){
     userName = req.body.userName;
     password = req.body.password;

  }
fs.readFile('config.json', 'utf-8', (err, data) => {
    if (err) throw err;

    // Parse the JSON data
    let admin = JSON.parse(data);
    console.log(admin.userName);
    console.log(admin.password);

    console.log(admin);
    if (admin.userName === userName && admin.password === password) {
      res.status(200).send("success");
    }else{
      res.status(401).send("Invalid Credentials");
    }
  });
  
})


// set application port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

