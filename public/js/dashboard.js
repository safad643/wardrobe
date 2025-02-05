


function loadcatogory(){
  fetch('/admin/catogory',{
    method:'get'})
    .then(response => response.text())
    .then((html)=>{
      document.querySelector('.main-panel').innerHTML=html
    })
}

function catogoryadd(){
  fetch('/admin/catogoryadd',{
    method:'get'})
    .then(response => response.text())
    .then((html)=>{
      
      document.querySelector('.main-panel').innerHTML=html;
    })
}

function catogoryadder(e) {
  e.preventDefault();

  // Get the input fields and error messages
  const catogoryName = document.getElementById('updatename').value.trim();
  const description = document.getElementById('descr').value.trim();
  const nameError = document.getElementById('nameError');
  const descError = document.getElementById('descError');

  // Reset error messages
  nameError.style.display = 'none';
  descError.style.display = 'none';

  // Validate the category name field
  if (catogoryName === '') {
    nameError.textContent = 'Name is required';
    nameError.style.display = 'block';
    document.getElementById('updatename').focus();
    return false;
  }

  // Validate the description field
  if (description === '') {
    descError.textContent = 'Description is required';
    descError.style.display = 'block';
    document.getElementById('descr').focus();
    return false;
  }

  // Make the fetch request to add the category
  fetch('/admin/catogoryadd', {
    method: 'post',
    body: JSON.stringify({ description, catogoryName }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => {
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json(); // Parse JSON response
      } else {
        return response.text(); // Parse HTML or plain text response
      }
    })
    .then(data => {
      if (typeof data === 'object' && data.error) {
        // Handle JSON error response (e.g., "Category already exists")
        nameError.textContent = data.error;
        nameError.style.display = 'block';
        document.getElementById('updatename').focus();
      } else {
        // Handle HTML response (success case)
        document.querySelector('.main-panel').innerHTML = data;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


function updateCategory(ogname){
  fetch('/admin/catogoryUpdate',{method:'get',headers:{'Content-Type':'application/json'}})
  .then(response => response.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
    document.getElementById('ogname').value=ogname
  })
  
}

function catogoryupdate(event){
  event.preventDefault()
  const ogname = document.getElementById('ogname').value
  const name = document.getElementById('updatename').value
  
  
  fetch('/admin/catogoryupdate',{method:'post',body:JSON.stringify({ogname,name}),headers:{'Content-Type':'application/json'}})
  .then(response => response.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
  })

  
}

const Delete=function(identifier,data,bool){
  Swal.fire({
    title: "Do you want to delete this user?",
    customClass: {
      title: "swal_title",
    },
    showDenyButton: true,
    denyButtonText: `Delete`,
    confirmButtonText: "Cancel"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Changes are not saved", "", "info");
    } else if (result.isDenied) {
      fetch('/admin/delete',{method:'post',body:JSON.stringify({identifier,data,bool}),headers:{'Content-Type':'application/json'}})
      .then(Swal.fire("delted", "", "success"))
      .then((r)=>r.text())
      .then((html)=>{
        document.querySelector('.main-panel').innerHTML=html
      })
      .catch(err=>console.log(err))
    }
  });
}

function loadusermanagment(){
  fetch('user-managment',{method:'get'})
  .then((r)=>r.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
  })
  .catch(err=>console.log(err))
}
function dashboard(){
  fetch('dashboard',{method:'get'})
  .then((r)=>r.text())
  .then((html)=>{ 
    document.querySelector('.main-panel').innerHTML=html
  })
  .catch(err=>console.log(err))
}

function productload(){
  fetch('product-managment',{method:'get'})
  .then((r)=>r.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
  })
  .catch(err=>console.log(err))
}

function updateprodcts(name,img1,img2,img3){
  fetch('/admin/productUpdate',{method:'get'})
  .then(response => response.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
    document.getElementById('ogname').value=name
    document.getElementById('img1').src = img1
    document.getElementById('img2').src = img2
    document.getElementById('img3').src = img3
  })
}

function productadd(){
 
  
  fetch('/admin/productadd',{method:'get'})
  .then(response => response.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
  })
}

function productAdder(e) {
  e.preventDefault();

  // Clear previous error messages
  document.querySelectorAll('.error-message').forEach(el => el.remove());

  // Helper function to display error messages
  function showError(input, message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.style.color = 'red';
    error.textContent = message;
    input.parentNode.insertBefore(error, input.nextSibling);
  }

  // Validate Name
  const nameInput = document.querySelector('input[name="name"]');
  if (!nameInput.value || nameInput.value.length < 3) {
    showError(nameInput, 'Name must be at least 3 characters long.');
    return;
  }

  // Validate Price
  const priceInput = document.querySelector('input[name="price"]');
  if (!priceInput.value || parseFloat(priceInput.value) <= 0) {
    showError(priceInput, 'Price must be a positive number.');
    return;
  }

  // Validate Category
  const categoryInput = document.querySelector('select[name="category"]');
  if (!categoryInput.value) {
    showError(categoryInput, 'Please select a category.');
    return;
  }

  // Validate Count
  const countInput = document.querySelector('input[name="count"]');
  if (!countInput.value || parseInt(countInput.value) <= 0) {
    showError(countInput, 'Count must be a positive integer.');
    return;
  }

  // Validate Colors
  const colorsInput = document.querySelector('input[name="colors"]');
  if (!colorsInput.value || colorsInput.value.split(',').length === 0) {
    showError(colorsInput, 'Please provide at least one color.');
    return;
  }

  // Validate Description
  const descrInput = document.querySelector('textarea[name="descr"]');
  if (!descrInput.value || descrInput.value.length < 10) {
    showError(descrInput, 'Description must be at least 10 characters long.');
    return;
  }

  // Validate Images
  const imageInputs = [document.getElementById('image1'), document.getElementById('image2'), document.getElementById('image3')];
  const images = imageInputs.filter(input => input.files.length > 0);
  if (images.length === 0) {
    showError(imageInputs[0], 'Please upload at least one image.');
    return;
  }

  // Prepare images from croppers
  let imageData = [];
  for (let i = 1; i < 4; i++) {
    const canvas = croppers[i].getCroppedCanvas();
    if (canvas) {
      const base64Image = canvas.toDataURL('image/png');
      imageData.push(base64Image);
    }
  }

  // Create FormData from the form
  const formdata = new FormData(e.target);

  // Append images to FormData
  imageData.forEach((image, index) => {
    formdata.append(`image${index}`, image);
  });

  // Convert FormData to a plain object
  const formObject = {};
  formdata.forEach((value, key) => {
    formObject[key] = value;
  });

  // Send the data to the server
  fetch('/admin/productadd', {
    method: 'POST',
    body: JSON.stringify(formObject),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => {
      const contentType = response.headers.get('Content-Type');

      if (contentType && contentType.includes('application/json')) {
        return response.json().then((data) => {
          const errorMessage = data.error || "An error occurred";
          document.getElementById('errp').innerHTML = errorMessage;
        });
      } else {
        return response.text().then((html) => {
          document.querySelector('.main-panel').innerHTML = html;
        });
      }
    })
    .catch((error) => {
      console.error('Error during fetch:', error);
      document.querySelector('#error-message').innerHTML = "An error occurred while processing your request.";
    });
}


let croppers={}
function cropper(index){
  const files = document.getElementById(`image${index}`)
  const previiew=document.getElementById(`prev${index}`)
  const file = files.files[0]
    if (file) {
      const objectURL = URL.createObjectURL(file)
      previiew.src = objectURL
      previiew.style.display = 'block'
      if (croppers[index]) {
        croppers[index].destroy(); 
      }
      croppers[index] = new Cropper(previiew, {
        aspectRatio: 1,
        cropBoxResizable: false,
        cropBoxMovable: true, 
        dragMode: 'none',
        ready: function () {
          
          this.cropper.setCropBoxData({
            width: 100, 
            height: 100, 
          });
        },
      });
    }
}

function showproductimages(a,b,c){
  Swal.fire({
    title: "Images",
    html: `
      <div style="display: flex; justify-content: center; gap: 10px;">
      
        <img src=${a} alt="Image 1" style="width: 100px; height: auto;" />
        <img src=${b} alt="Image 2" style="width: 100px; height: auto;" />
        <img src=${c} alt="Image 3" style="width: 100px; height: auto;" />
      </div>
    `,customClass: {
      title: "swal_title",
    },
    showConfirmButton: true,
  });
}


function updateproduct(e){
  e.preventDefault()
  let images=[]
  for(let i=1;i<=3;i++){
    const canvas = croppers[i]?.getCroppedCanvas();
    if(canvas){
      const base64Image = canvas.toDataURL('image/png'); 
    images.push(base64Image)
    }else{
      images.push('noimage')
    }
  }
  const fromdata={}
  const inputs=[
    document.getElementById('ogname'),
    document.getElementsByName('name')[0],
    document.getElementsByName('price')[0],
    document.getElementsByName('category')[0],
    document.getElementsByName('count')[0],
    document.getElementsByName('colors')[0],
    document.getElementsByName('rating')[0],
  ]
  for(i in images){
    if(images[i]==='noimage'){
      continue
    }else{
      fromdata[`image${i}`]=images[i]
    }
    
  }
  inputs.forEach((input)=>{
    if(input.value.trim()){
      fromdata[input.name]=input.value
    }
  })
  console.log(fromdata);
  
  fetch('/admin/productUpdate',{method:'post',body:JSON.stringify(fromdata),headers:{'Content-Type': 'application/json'}})
  .then((response)=>response.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
  })
}


function pageback(){
  console.log('hahahah');
  
  if(!(document.getElementById('pageno').innerHTML==1)){
    document.getElementById('pageno').innerHTML--
  }
  const current =parseInt(document.getElementById('pageno').innerHTML)

  
  if(current<10){
    const startrow=(current)*3
    const endrow=(current+1)*3
    
    
    
    
    for(let i=startrow;i<=endrow;i++){
      let rowElement = document.getElementById(`row${i}`);
      console.log(rowElement)
      if (rowElement) { 
        rowElement.style.display = 'none';
    }
    }
  }
  const startrow=(current-1)*3+1//10
  const endrow=(current)*3//20
  for(let i=startrow;i<=endrow;i++){
    document.getElementById(`row${i}`).style.display=''
  }
}

function pagenext(){
  let current=document.getElementById('pageno').innerHTML++
  current++
  if(current>1){
    const startrow=(current-1)*3//20
    const endrow=((current-2)*3)+1//11
    for(let i=startrow;i>=endrow;i--){
      document.getElementById(`row${i}`).style.display='none'
    }
  }
  const startrow=(current-1)*3+1//21
  const endrow=(current)*3//30
  for(let i=startrow;i<=endrow;i++){
    document.getElementById(`row${i}`).style.display=''
  }
}

function filterRows() {
  const searchValue = document.getElementById('searchBox').value.toLowerCase();
  const rows = document.querySelectorAll('table tbody tr');
  
  rows.forEach(row => {
    const name = row.querySelector('td:nth-child(2)'); // Assuming the second column is 'name'
    if (name && name.textContent.toLowerCase().includes(searchValue)) {
      row.style.display = ''; // Show the row
    } else {
      row.style.display = 'none'; // Hide the row
    }
  });
}

function laodordermanagment(){
 
    fetch('/admin/ordermanagment',{
      method:'get'})
      .then(response => response.text())
      .then((html)=>{
        document.querySelector('.main-panel').innerHTML=html
      })
  
  
}