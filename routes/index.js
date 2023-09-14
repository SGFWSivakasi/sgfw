var express = require('express');
var router = express.Router();
const Product = require('../models/products');
const Bill = require('../models/bill');
const Login = require('../models/login');
const puppeteer = require("puppeteer");
var fs = require("fs");
const getPage = require('../models/page');

// const chromium = require('chrome-aws-lambda');

var converter = require('number-to-words');


/* GET home page. */
router.get('/', function(req, res, next) {
  Bill.find()
  .then(ress=>{
    res.render('index', { title: 'SGFW' , bills:ress});
  })
  .catch(err=>{console.log(err)});
  
});

router.get('/products', function(req,res,next){

  Product.find()
  .then(result=>{
    res.render('products',{title:'SGFW | Products', products:result});
  })

  
})

router.post('/addNewProduct', function(req,res,next){
  
  var newProduct = new Product({
    name:req.body.productName,
    rate:req.body.productRate,
    per:req.body.productPer,
    type:req.body.productType
  })

  newProduct.save()
  .then(()=>{
    res.redirect('/products');
  })

})

router.post('/updateProduct/:id', function(req,res,next){
  var id = req.params.id;
  Product.findByIdAndUpdate(id,
    {$set:{
      name:req.body.name,
      rate:req.body.rate,
      per:req.body.per,
      type:req.body.type
    }})
    .then(()=>{
      return res.redirect('/products');
    })
    .catch(err=>{
      console.log(err);
    });
})

router.get('/deleteProduct/:id',function(req,res,next){
  var id = req.params.id;
  Product.findByIdAndDelete(id)
  .then(()=>{
    return res.redirect('/products');
  })
  .catch(err=>{
    console.log(err);
  });
})

router.get('/inventory', function(req,res,next){
  Product.find()
  .then(result=>{
    res.render('inventory',{title:'SGFW | Inventory', products:result});
  })
  
})

router.post('/updateStock/:id', function(req,res,next){

  var id = req.params.id;
  var count = req.body.newStock;

  Product.findByIdAndUpdate(id, {
    $inc:{
      currentStock : count
    }
  }).then(()=>{
      return res.redirect('/inventory');
  })
  .catch(err=>{console.log(err)});


})

router.get('/newBill', function(req,res,next){
  Product.find()
  .then(result=>{
    res.render('newBill', {title:'New Bill | SGFW', products:result});
  })
  .catch(err=>{
    console.log(err);
    return res.redirect('/');
  })
})

router.post('/addNewBill', function(req,res,next){
var productIDS = {};

const {productID, productName, type, per, currentStock, newStock, subValueAmt, rate } = req.body;


var productNames = [];
productNames = productName;

var types = [];
types = type;

var currentStocks = [];
currentStocks = currentStock;

var newStocks = [];
newStocks = newStock;

var rates = [];
rates = rate;

var productPers = [];
productPers = per;

var subValues = [];
subValues = subValueAmt;



  for(i=0;i<req.body.length;i++){
    var prodID = productID[i];
    var orderedValue = newStock[i];
    Product.findByIdAndUpdate(prodID, {
      $inc:{
        currentStock: -orderedValue
      }
    }).then().catch(err=>{console.log(err)});
  }

  var cartItems = [];

  for(i=0; i< req.body.length; i++){
    if(newStocks[i] > 0){
      cartItems.push({
        name:productNames[i], 
        rate:rate[i], 
        per:productPers[i],
        order:newStocks[i], 
        subTotal:subValues[i]
      });
    }
  }



  const netTotal = req.body.netTotal;
  const discValue = req.body.discValue;
  const discTotal = req.body.discTotalVal;
  const subTotal = req.body.subTotalVal;
  const pckChargeVal = req.body.pckChargeVal;
  const finalBillValuee = req.body.finalBillVal;

  const partyName = req.body.partyName;
  const partyMob = req.body.partyMob;
  const partyEmail = req.body.partyEmail;
  const partyAddress = req.body.partyAddress;

  const cgst = req.body.cgstVal;
  const sgst = req.body.sgstVal;

  var newBill = new Bill({
    partyName : partyName,
    partyAddress : partyAddress,
    partyMob : partyMob,
    partyEmail : partyEmail,
    billItems : cartItems,
    netTotal : netTotal ,
    discValue : discValue ,
    discAmt : discTotal,
    subTotal : subTotal,
    cgst : cgst,
    sgst : sgst,
    overallTotal : finalBillValuee,
    amountInWords: converter.toWords(finalBillValuee)
})

 newBill.save().then(ress=>{return res.redirect('/')}).catch(err=>{console.log(err)});

  // res.redirect('/');

})

router.get('/billDeletion/:id', function(req,res,next){
  var id = req.params.id;
  Bill.findByIdAndDelete(id).then(ress=>{return res.redirect('/')}).catch(err=>{console.log(err); res.redirect('/')});
})

router.get('/generateEstimate/:id', function(req,res,next){
  var id = req.params.id;
 
  Bill.findById(id)
  .then(result=>{
    
    res.render('estimateGenerator', {bill:result}, function(err,htmll){

      let browser;
      (async () => {
        

        const browser = await puppeteer.launch({
          headless:false,
          args: ['--no-sandbox','--disable-setuid-sandbox'],
          executablePath: "/opt/render/project/src/.cache/puppeteer/chrome/linux-116.0.5845.96/chrome.exe",
          ignoreDefaultArgs: ['--disable-extensions']
        });
    
      // create a new page
      const page = await browser.newPage();
            
      // Configure the navigation timeout
      page.setDefaultNavigationTimeout(0);

      await page.setCacheEnabled(false); 
      // set your html as the pages content

      const html = htmll;
      await page.setContent(html, {
      waitUntil: 'domcontentloaded'
      });
      await page.emulateMediaType('screen');
      const pdf = await page.pdf({format: "A4"});
      res.contentType("application/pdf");


      // optionally:
      res.setHeader(
      "Content-Disposition",
      "attachment; filename=invoice.pdf"
      );

      res.send(pdf);

    }
      )()
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
      }) 
      .finally(() => browser?.close());

  })

})

})

router.get('/login', function(req,res,next){
  res.render('login', {title:'Admin Login | SGFW', messages:null, login: req.session.login ? req.session.login : null});
})

router.post('/login', function(req,res,next){
  var username = req.body.username;
  var password = req.body.password;
  // // console.log(username, password)
  Login.find()
  .then(result=>{
    console.log(result);
    if(result[0].userName === username && result[0].password === password){
      req.session.login = true;
      res.redirect('/');
    }
    else{
      var message = "Wrong Credentials";
      res.render('login', {title:'SGFW | Login', messages: message, login: req.session.login ? req.session.login : null});
    }
  })
  .catch(err=>{
      console.log(err);
      return res.render('login');
  })
  
  // var credentials = new Login({
  //   userName:username,
  //   password:password
  // })

  // credentials.save().then(ress=>{res.redirect('/')});

})

router.get('/logout', function(req,res,next){
  req.session.login = false;
  res.redirect('/');
})

router.get('/reports', isLoggedIn, function(req,res,next){

  Bill.find()
  .then(ress=>{
    res.render('reports', {title:'Reports | SGFW', bills:ress});
  })
  
})

router.get('/customers', isLoggedIn, function(req,res,next){

  Bill.find()
  .then(ress=>{
    res.render('customers', {title:'Customers | SGFW', bills:ress});
  })
  
})

router.get('/saleByDay', isLoggedIn, function(req,res,next){
  res.render('saleByDay', {title:'Sale By Day | SGFW', bills:{},from:{}, to:{}, totalOrders: 0, subTotal:0, cgst: 0, sgst:0, overallTotal:0});
})

router.post('/getSaleReport', function(req,res,next){
  var from = req.body.from;
  var to = req.body.to;

  Bill.find({
    date:{
      $gte:from,
      $lt:to
    },
  })
  .then(results=>{
    var subTotal = 0;
    var cgst = 0;
    var sgst = 0;
    var overallTotal = 0;

    results.forEach(bill=>{
      subTotal += Number(bill.subTotal);
      cgst += Number(bill.cgst);
      sgst += Number(bill.sgst);
      overallTotal += Number(bill.overallTotal);
    })

    res.render('saleByDay',{title:'Sale By Day | SGFW', from:from, to:to, bills:results, totalOrders: results.length, subTotal:subTotal, cgst: cgst, sgst:sgst, overallTotal:overallTotal});
  })
})

router.get('/saleByItems', isLoggedIn, function(req,res,next){
  res.render('saleByItems', {title:'Sale By Items | SGFW', items:{}, from:{}, to:{}});
})

router.post('/getSaleItemsReport', isLoggedIn, function(req,res,next){
  
  var from = req.body.from;
  var to = req.body.to;
  var newArray = [];

  Bill.find({
    date:{
      $gte:from,
      $lt:to
    },
  })
  .then(result=>{
   result.forEach(bill=>{
    bill.billItems.forEach(entry=>{
     newArray.push({name: entry.name, count: Number(entry.order)});
    })
   })

   var holder = {};

    newArray.forEach(function(d) {
      if (holder.hasOwnProperty(d.name)) {
        holder[d.name] = holder[d.name] + d.count;
      } else {
        holder[d.name] = d.count;
      }
    });

    var obj2 = [];

    for (var prop in holder) {
      obj2.push({ name: prop, order: holder[prop] });
    }

    res.render('saleByItems', {title:'Sale By Items | SGFW', items:obj2, from:from, to:to});
   
  })

  
})


module.exports = router;

function isLoggedIn(req,res,next){
  if(req.session.login === true){
      return next();
  }
  res.redirect('/login');
}