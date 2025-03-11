function loadcatogory(){
  fetch('/admin/catogory',{
    method:'get'})
    .then(response => response.text())
    .then((html)=>{
      document.querySelector('.main-panel').innerHTML=html
      setActiveNavItem('Category Management')
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
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        const errorElement = document.getElementById('errorcatognameupdate');
        errorElement.innerText = data.error;
        errorElement.style.display = 'block';
      });
    }
    return response.text();
  })
  .then((html) => {
    if (html) {
      document.querySelector('.main-panel').innerHTML = html;
    }
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
    setActiveNavItem('User Management')
  })
  .catch(err=>console.log(err))
}
function dashboard(){
  window.location.reload()
}

function productload(){
  fetch('product-managment',{method:'get'})
  .then((r)=>r.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
    setActiveNavItem('Product Management')
  })
  .catch(err=>console.log(err))
}

function updateprodcts(name,img1,img2,img3,varientarray){
 
  
  fetch('/admin/productUpdate',{method:'get'})
  .then(response => response.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
    document.getElementById('ogname').value=name
    document.getElementById('img1').src = img1
    document.getElementById('img2').src = img2
    document.getElementById('img3').src = img3
    // Parse variant array and create input fields
    const variants = varientarray
    
    // Find the target div after Rating input
    const ratingDiv = document.querySelector('input[name="rating"]').closest('.form-group');
    
    // Create variant fields container
    const variantContainer = document.createElement('div');
    variantContainer.id='existingvariants'
    variantContainer.className = 'form-group';
    variantContainer.innerHTML = '<label>Variants</label>';
    
    // Add variant input fields
    variants.forEach(variant => {
      const inputDiv = document.createElement('div');
      inputDiv.className = 'form-group';
      inputDiv.style.display = 'flex';
      inputDiv.style.alignItems = 'center';
      inputDiv.style.gap = '10px';
      
      const variantId = `variant_${variant.color}_${variant.size}`;
      inputDiv.id = variantId;
      
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'form-control varientinput';
      input.name = variantId;
      input.value = variant.count;
      input.min = 0;
      input.style.width = '200px';
      
      const label = document.createElement('label');
      label.textContent = `Count of ${variant.color} - ${variant.size}`;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-danger';
      removeBtn.textContent = 'Remove';
      removeBtn.type = 'button';
      removeBtn.onclick = () => removeVariant(variantId);
      
      inputDiv.appendChild(label);
      inputDiv.appendChild(input);
      inputDiv.appendChild(removeBtn);
      variantContainer.appendChild(inputDiv);
    });
    
    // Insert after rating div
    ratingDiv.parentNode.insertBefore(variantContainer, ratingDiv.nextSibling);
  })
}

function productadd(){
 
  
  fetch('/admin/productadd',{method:'get'})
  .then(response => response.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
  })
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


function updateproduct(e) {
  e.preventDefault();

  // Check if any variants exist (either existing or newly added)
  const selectedVariants = document.getElementById('selectedVariants');
  const existingVariants = document.getElementById('existingvariants');


  if (!(selectedVariants.children.length || existingVariants.children.length>1)) {
    
    
    document.getElementById('prducter').textContent = 'At least one variant is required';
    return;
  }

  // Check all variant inputs for values
  const variantInputs = document.querySelectorAll('.varientinput');
 
  let hasEmptyInputs = false;

  variantInputs.forEach(input => {
    
    
    // Remove any existing error messages
    const existingError = input.parentElement.querySelector('.variant-error');
    if (existingError) {
      existingError.remove();
    }

    if (!input.value || parseInt(input.value) <= 0) {
      // Create and add error message below the specific input
      const errorDiv = document.createElement('div');
      errorDiv.className = 'text-danger variant-error';
      errorDiv.style.fontSize = '0.875rem';
      errorDiv.textContent = 'Please enter a valid quantity';
      input.parentElement.appendChild(errorDiv);
      hasEmptyInputs = true;
    }
  });

  if (hasEmptyInputs) {
    
    return;
  }


  // Get form data
  const form = e.target;
  const formData = new FormData(form);
  const data = {};

  // Convert form data to object and remove empty values
  for (let [key, value] of formData.entries()) {
    if (value.trim()) {
      data[key] = value;
    }
  }

  // Handle cropped images
  for (let i = 1; i <= 3; i++) {
    const canvas = croppers[i]?.getCroppedCanvas();
    if (canvas) {
      const base64Image = canvas.toDataURL('image/png');
      data[`image${i-1}`] = base64Image;
    }
  }

  fetch('/admin/productUpdate', {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.text())
  .then(html => {
    document.querySelector('.main-panel').innerHTML = html;
  });
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
  setActiveNavItem('Order Management')
    fetch('/admin/ordermanagment',{
      method:'get'})
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

  // Validate variants
  const variantInputs = document.querySelectorAll('input[name^="variant_"]');
  if (variantInputs.length === 0) {
    const variantButton = document.querySelector('[data-target="#variantModal"]');
    showError(variantButton, 'Please add at least one variant.');
    return;
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


  // Validate Colors


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

  // Convert FormData to a plain object
  const formObject = {};
  formdata.forEach((value, key) => {
    formObject[key] = value;
  });

  // Add images to the form object
  imageData.forEach((image, index) => {
    formObject[`image${index}`] = image;
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

function addVariant() {
  const color = document.getElementById('modalColorSelect').value;
  const size = document.getElementById('modalSizeSelect').value;

  if (!color || !size) {
    const error = document.getElementById('varient_err');
    error.innerHTML = 'please select both color and size';
    error.style.display = 'block';
    return;
  }

  // Check if variant already exists
  const existingVariant = document.querySelector(`input[name="variant_${color}_${size}"]`);
  if (existingVariant) {
    const error = document.getElementById('varient_err');
    error.innerHTML = 'varient already exist';
    error.style.display = 'block';
    return;
  }

  const selectedVariantsDiv = document.getElementById('selectedVariants');

  // Generate unique ID for the variant container
  const variantId = `variant_${color}_${size}`;

  // Create container for the variant
  const variantContainer = document.createElement('div');
  variantContainer.className = 'form-group';
  variantContainer.id = variantId;

  // Create input div with flex layout
  const inputDiv = document.createElement('div');
  inputDiv.className = 'form-group';
  inputDiv.style.display = 'flex';
  inputDiv.style.alignItems = 'center';
  inputDiv.style.gap = '10px';

  // Create label
  const label = document.createElement('label');
  label.textContent = `Count of ${color} - ${size}`;

  // Create input field
  const input = document.createElement('input');
  input.type = 'number';
  input.name = `variant_${color}_${size}`;
  input.className = 'form-control varientinput';
  input.min = 0;
  input.style.width = '200px';

  // Create remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-danger';
  removeBtn.textContent = 'Remove';
  removeBtn.setAttribute('onclick', `removeVariant('${variantId}')`);

  // Add elements to input div
  inputDiv.appendChild(label);
  inputDiv.appendChild(input);
  inputDiv.appendChild(removeBtn);

  // Add input div to container
  variantContainer.appendChild(inputDiv);

  // Add container to selectedVariants div
  selectedVariantsDiv.appendChild(variantContainer);

  // Reset modal selections
  document.getElementById('modalColorSelect').value = '';
  document.getElementById('modalSizeSelect').value = '';

  // Close modal
  $('#variantModal').modal('hide');
}
function removeVariant(id) {
  const variantElement = document.getElementById(id);
  if (variantElement) {
    variantElement.remove();
  }
  else{
    alert('remove faield')
  }
  }
function updateProductStatus(orderId, productId, status,varient) {
  fetch(`/admin/orders/update-status`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          orderId,
          productId,
          status,
          varient
      })
  })
  .then(async response => {
      if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Update failed');
      }
      showToast('Product status updated successfully', 'success');
  })
  .catch(error => {
      console.error('Error:', error);
      showToast(error.message || 'Error updating product status', 'error');
  });
}

// Toast notification helper
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => toast.remove(), 3000);
  
  return toast;
}


// Add this CSS to your existing styles
const styles = `
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }
  
  .toast-info {
    background-color: #3498db;
  }
  
  .toast-success {
    background-color: #2ecc71;
  }
  
  .toast-error {
    background-color: #e74c3c;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;


function coupnload(){
  fetch('coupon-managment',{method:'get'})
  .then((r)=>r.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
    setActiveNavItem('Coupon Management')
  })
  .catch(err=>console.log(err))
}


function addcouponloader(){
  fetch('addcoupon',{method:'get'})
  .then((r)=>r.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
  })
}


 // Set min date for start date to today
 const today = new Date().toISOString().split('T')[0];
 document.getElementById('startDate').setAttribute('min', today);

 // Update end date min when start date changes
 document.getElementById('startDate').addEventListener('change', function() {
   const startDate = this.value;
   document.getElementById('endDate').setAttribute('min', startDate);
   
   // Clear end date if it's before start date
   const endDate = document.getElementById('endDate').value;
   if (endDate && endDate < startDate) {
     document.getElementById('endDate').value = '';
   }
 });




 function validateForm() {
   const form = document.querySelector('.forms-sample');
   const inputs = form.querySelectorAll('input, select');
   let isValid = true;

   inputs.forEach(input => {
     const validationMessage = input.nextElementSibling;
     validationMessage.textContent = '';

     if (!input.value.trim()) {
       validationMessage.textContent = `${input.name} is required`;
       isValid = false;
     }

     if (input.name === 'startDate') {
       const selectedDate = new Date(input.value);
       const today = new Date();
       today.setHours(0, 0, 0, 0);

       if (selectedDate < today) {
         validationMessage.textContent = 'Start date cannot be in the past';
         isValid = false;
       }
     }

     if (input.name === 'endDate') {
       const startDate = new Date(document.getElementById('startDate').value);
       const endDate = new Date(input.value);

       if (endDate <= startDate) {
         validationMessage.textContent = 'End date must be after start date';
         isValid = false;
       }
     }

     if (input.name === 'discountValue') {
       const discountValue = parseFloat(input.value);
       const minPurchase = parseFloat(document.querySelector('input[name="minPurchase"]').value);

       if (discountValue > minPurchase) {
         validationMessage.textContent = 'Discount value cannot be greater than minimum purchase amount';
         isValid = false;
       }
     }
   });

   return isValid;
 }

 // Modify your existing couponAdder function to include validation and error handling
 async function couponAdder(event) {
  
   event.preventDefault();
   try {
     if (!validateForm()) {
       return;
     }

     const form = event.target;
     const formData = new FormData(form);
     const data = Object.fromEntries(formData);

     const response = await fetch('/admin/add-coupon', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(data)
     });

     if (!response.ok) {
       throw new Error('Failed to add coupon');
     }

     const result = await response.json();
     if (result.success) {
       coupnload(); // Load coupons page instead of redirect
     } else {
       // Handle coupon code already exists error
       if (result.message === "Coupon code already exists") {
         document.getElementById('errp').textContent = 'This coupon code is already in use';
       } else {
         document.getElementById('errp').textContent = result.message || 'Failed to add coupon';
       }
     }
   } catch (error) {
     console.error('Error adding coupon:', error);
     document.getElementById('errp').textContent = 'An error occurred while adding the coupon';
   }
 }

 async function deleteCoupon(id) {
   try {
     const result = await Swal.fire({
       title: 'Are you sure?',
       text: "You won't be able to revert this!",
       background: '#191c24',
       color: '#fff',
       showCancelButton: true,
       confirmButtonColor: '#3085d6',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Yes, delete it!'
     });

     if (result.isConfirmed) {
       const response = await fetch('/admin/delete-coupon', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           id: id
         })
       });

       if (!response.ok) {
         throw new Error('Failed to delete coupon');
       }

       const data = await response.json();
       
       if (data.success) {
         Swal.fire({
           title: 'Deleted!',
           text: 'Coupon has been deleted.',
           icon: 'success',
           background: '#191c24',
           color: '#fff'
         });
         coupnload(); // Refresh the coupons list
       } else {
         throw new Error(data.message || 'Failed to delete coupon');
       }
     }
   } catch (error) {
     console.error('Error deleting coupon:', error);
     Swal.fire(
       'Error!',
       'Failed to delete coupon',
       'error'
     );
   }
 }

function updateCouponloader(id){
  fetch('updatecouponloader',{method:'post',body:JSON.stringify({id}),headers:{'Content-Type':'application/json'}})
  .then((r)=>r.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
    document.getElementById('id').value=id
  }).catch(err=>console.log(err))
}

function couponupdate(e){
  e.preventDefault()
  if(!validateForm()){
    return
  }
  const id = document.getElementById('id').value
  const form = e.target
  const formData = new FormData(form)
  const data = Object.fromEntries(formData)
  fetch('/admin/updatecoupon',{method:'post',body:JSON.stringify({id,data}),headers:{'Content-Type':'application/json'}})
  .then((r)=>r.text())
  .then((html)=>{
    document.querySelector('.main-panel').innerHTML=html
  }).catch(err=>console.log(err))
}


async function getreturndata(returnid,notification) {
  
  try {
    const response = await fetch(`/admin/returns/${returnid}`);
    const data = await response.json();

    
    if(notification){
      const notificationResponse = await fetch('/admin/removereturnnotification', {
      method: 'POST',
      body: JSON.stringify({returnid: returnid}),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const notificationData = await notificationResponse.json();
    
    
    if(notificationData.success) {
    // Find and remove the notification element
    const notificationElement = document.querySelector(`[onclick="getreturndata('${returnid}',true)"]`)
    if (notificationElement) {
      // Remove the divider after the notification if it exists
      const nextDivider = notificationElement.nextElementSibling;
      if (nextDivider && nextDivider.classList.contains('dropdown-divider')) {
        nextDivider.remove();
      }
      // Remove the notification
      notificationElement.remove();
    }
    }
    }
    
    showReturnModal(data);
  } catch (error) {
    console.error('Error fetching return data:', error);
  }
}
function setActiveNavItem(menuTitle) {
  // Remove active class from all nav items
  document.querySelectorAll('.nav-item.menu-items').forEach(item => {
    item.classList.remove('active');
  });
  
  // Find and add active class to the matching nav item
  const navItems = document.querySelectorAll('.nav-item.menu-items');
  navItems.forEach(item => {
    const titleElement = item.querySelector('.menu-title');
    if (titleElement && titleElement.textContent === menuTitle) {
      item.classList.add('active');
    }
  });
}


function showOrderDetails(orderId,productid,varient) {
  fetch(`/admin/orderdetails/${orderId}/${productid}/${varient}`,{method:'get'})  
  .then((r)=>r.json())
  .then((data)=>{
    const order = data.order;
    const item = order.items[0];

    // Order Summary
    
    document.getElementById('modalOrderDate').textContent = new Date(order.createdAt).toLocaleString();
    document.getElementById('modalPaymentMethod').textContent = order.paymentMethod;
    document.getElementById('modalSubtotal').textContent = item.subtotal;
    document.getElementById('modalDelivery').textContent = '40';
    document.getElementById('modalDiscount').textContent = item.subtotal - item.total;
    document.getElementById('modalTotal').textContent = item.total;

    // Handle coupon details
    if (order.coupon) {
      document.getElementById('couponDetails').style.display = 'block';
      document.getElementById('modalCouponCode').textContent = order.coupon.code;
      document.getElementById('modalCouponDiscount').textContent = order.coupon.discount;
    } else {
      document.getElementById('couponDetails').style.display = 'none';
    }

    // Product Details
    document.getElementById('modalProductName').textContent = order.name;
    document.getElementById('modalVariantSize').textContent = item.varient.size;
    document.getElementById('modalVariantColor').textContent = item.varient.color;
    document.getElementById('modalQuantity').textContent = item.quantity;
    document.getElementById('modalStatus').textContent = item.status;

    // Shipping Address
    document.getElementById('modalAddressStreet').textContent = order.address.street;
    document.getElementById('modalAddressCity').textContent = order.address.city;
    document.getElementById('modalAddressState').textContent = order.address.state;
    document.getElementById('modalAddressCountry').textContent = order.address.country;
    document.getElementById('modalAddressPostal').textContent = order.address.postalCode;
    document.getElementById('modalAddressPhone').textContent = order.address.phone;

    // Customer Details
    document.getElementById('modalCustomerName').textContent = order.user.name;
    document.getElementById('modalCustomerEmail').textContent = order.user.email;
    // Set product image
    document.getElementById('modalProductImage').src = order.image;
    $('#orderDetailsModal').modal('show');
  })
}

function hideOrderDetails() {
  $('#orderDetailsModal').modal('hide');
  $('.modal-backdrop').remove(); 
  $('body').removeClass('modal-open'); 
}

  function showVariants(variants) {
    // Remove existing modal if present
    const existingModal = document.getElementById('variantsModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal HTML with 3 columns and smaller width
    const modalHTML = `
      <div class="modal fade" id="variantsModal" tabindex="-1" role="dialog" aria-labelledby="variantsModalTitle">
        <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="variantsModalTitle">Product Variants</h5>
              <button type="button" class="btn-close" onclick="hideVariantsModal()" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="variantsTableContainer">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th scope="col" style="width: 40%">Color</th>
                    <th scope="col" style="width: 30%">Size</th>
                    <th scope="col" style="width: 30%">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  ${variants.map(variant => `
                    <tr>
                      <td>
                        <div class="d-flex align-items-center">
                          <div style="width: 20px; height: 20px; background-color: ${variant.color}; margin-right: 10px; border-radius: 50%;" role="presentation"></div>
                          ${variant.color}
                        </div>
                      </td>
                      <td>${variant.size}</td>
                      <td>
                       
                          ${variant.count} units
                       
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal using jQuery since we're using Bootstrap 4
    $('#variantsModal').modal({
      keyboard: true,
      backdrop: true,
      focus: true
    });
    
    // Add event listener for modal close
    $('#variantsModal').on('hidden.bs.modal', function () {
      setTimeout(() => {
        $(this).remove();
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
      }, 150); // Wait for fade animation to complete
    });
  }

  function hideVariantsModal() {
    $('#variantsModal').modal('hide');
  }

