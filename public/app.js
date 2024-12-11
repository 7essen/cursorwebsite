document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const cartButton = document.getElementById('cartButton');
    const cartCount = document.getElementById('cartCount');
    const searchInput = document.getElementById('searchInput');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productModal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close-modal');
    const productModalDetails = document.getElementById('product-modal-details');
    const adminLoginButton = document.getElementById('adminLoginButton');
    const adminUsername = document.getElementById('adminUsername');
    const adminPassword = document.getElementById('adminPassword');

    let cart = [];
    let currentCategory = 'all';
    let isAdmin = false; // حالة تسجيل الدخول للأدمن

    function renderProducts(filter = 'all', searchTerm = '') {
        productGrid.innerHTML = '';
        const filteredProducts = products.filter(product => 
            (filter === 'all' || product.category === filter) &&
            (searchTerm === '' || product.name.includes(searchTerm))
        );

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-xl font-bold text-purple-600">${product.price} ر.س</span>
                        <div>
                            <button onclick="addToCart(${product.id})" class="add-to-cart-btn">أضف للسلة</button>
                            <button onclick="showProductDetails(${product.id})" class="text-sm text-purple-600 mt-1">التفاصيل</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add hover animation with GSAP
            gsap.fromTo(productCard, 
                { opacity: 0, y: 50 }, 
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
            
            productGrid.appendChild(productCard);
        });
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        cart.push(product);
        updateCartCount();
        
        Swal.fire({
            icon: 'success',
            title: 'تمت الإضافة',
            text: `تم إضافة ${product.name} إلى سلة التسوق`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });

        // Add cart animation
        gsap.fromTo(cartButton, 
            { scale: 1 }, 
            { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 }
        );
    }

    function updateCartCount() {
        cartCount.textContent = cart.length;
    }

    function showProductDetails(productId) {
        const product = products.find(p => p.id === productId);
        productModalDetails.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full mb-4">
            <h2 class="text-2xl font-bold mb-2">${product.name}</h2>
            <p class="text-gray-600 mb-4">${product.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-3xl font-bold text-purple-600">${product.price} ر.س</span>
                <button onclick="addToCart(${product.id})" class="bg-purple-600 text-white px-4 py-2 rounded">أضف للسلة</button>
            </div>
        `;
        
        productModal.style.display = 'block';
        
        // Animate modal entrance
        gsap.fromTo(productModal.querySelector('.modal-content'), 
            { opacity: 0, scale: 0.5 }, 
            { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }

    // تسجيل دخول الأدمن
    adminLoginButton.addEventListener('click', () => {
        const username = adminUsername.value;
        const password = adminPassword.value;

        // تحقق من اسم المستخدم وكلمة المرور
        if (username === 'admin' && password === 'password') {
            isAdmin = true;
            Swal.fire({
                icon: 'success',
                title: 'تم تسجيل الدخول',
                text: 'يمكنك الآن إضافة المنتجات.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });
            // يمكنك إضافة وظيفة لإظهار واجهة إضافة المنتجات هنا
        } else {
            Swal.fire({
                icon: 'error',
                title: 'فشل تسجيل الدخول',
                text: 'اسم المستخدم أو كلمة المرور غير صحيحة.'
            });
        }
    });

    // Cart functionality
    cartButton.addEventListener('click', () => {
        if (cart.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'سلة التسوق فارغة',
                text: 'لم تقم بإضافة أي منتجات بعد'
            });
            return;
        }

        const cartItems = cart.map(item => 
            `<div class="flex justify-between mb-2 p-2 bg-gray-100 rounded">
                <span>${item.name}</span>
                <span>${item.price} ر.س
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 mr-2">🗑️</button>
                </span>
            </div>` 
        ).join('');

        const totalPrice = cart.reduce((total, item) => total + item.price, 0);

        Swal.fire({
            title: 'محتويات سلة التسوق',
            html: `
                ${cartItems}
                <hr class="my-4">
                <div class="font-bold text-xl">المجموع الكلي: ${totalPrice} ر.س</div>
            `,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'إتمام الشراء',
            cancelButtonText: 'إغلاق'
        });
    });

    function removeFromCart(productId) {
        const index = cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            cart.splice(index, 1);
            updateCartCount();
            
            // Refresh the cart modal
            cartButton.click();
        }
    }

    // Category Filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get selected category
            currentCategory = button.dataset.category;
            
            // Render products based on category
            renderProducts(currentCategory);
        });
    });

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        renderProducts(currentCategory, searchTerm);
    });

    // Modal Close
    closeModal.addEventListener('click', () => {
        // Animate modal exit
        gsap.to(productModal.querySelector('.modal-content'), {
            opacity: 0, 
            scale: 0.5, 
            duration: 0.2,
            onComplete: () => {
                productModal.style.display = 'none';
            }
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === productModal) {
            closeModal.click();
        }
    });

    // Initial render
    renderProducts();
});

// Global function for cart and product interactions
window.addToCart = addToCart;
window.showProductDetails = showProductDetails;
