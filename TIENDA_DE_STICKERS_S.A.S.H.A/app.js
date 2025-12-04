// Espera a que todo el contenido HTML esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {


    // --- Selectores del DOM ---
    const productGrid = document.querySelector('.product-grid');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-btn');
    const categoryFilters = document.querySelector('.category-filters');
    const searchInput = document.getElementById('search-bar');
    const modal = document.getElementById('product-modal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');
    const modalQuantityInput = document.getElementById('modal-quantity');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminPanelModal = document.getElementById('admin-panel-modal');
    const adminPanelCloseBtn = document.getElementById('admin-panel-close-btn');
    const adminStickerSearch = document.getElementById('admin-sticker-search');
    const addStickerForm = document.getElementById('add-sticker-form');
    const clearCartButton = document.getElementById('clear-cart-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutModalCloseBtn = document.getElementById('checkout-modal-close-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const departmentSelect = document.getElementById('customer-department');
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentsList = document.getElementById('comments-list');
    const submitCommentBtn = document.getElementById('submit-comment-btn');
    const cooldownMsg = document.getElementById('comment-cooldown-msg');

    // --- Variables y Estado ---
    const CART_STORAGE_KEY = 'stickerShopCart';
    const STICKERS_STORAGE_KEY = 'stickerShopProducts';
    const COMMENTS_STORAGE_KEY = 'stickerShopComments';
    const VOTES_STORAGE_KEY = 'stickerShopVotedComments';
    const OWNED_COMMENTS_KEY = 'stickerShopOwnedComments';
    const LAST_COMMENT_TIME_KEY = 'stickerShopLastCommentTime';
    let cart = {};
    let allStickers = [];
    let cooldownInterval = null; // Para manejar el intervalo del cooldown
    let comments = [];
    let userVotes = {};
    let ownedCommentIds = [];

    /**
     * Guarda el estado actual del carrito en localStorage.
     */
    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    /**
     * Carga el carrito desde localStorage al iniciar la página.
     */
    function loadCart() {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
            } catch (e) {
                console.error("Error al cargar el carrito desde localStorage", e);
                cart = {}; // Si hay un error, empieza con un carrito vacío.
            }
        }
    }

    /**
     * Devuelve la lista inicial de stickers si la tienda está vacía.
     */
    function getInitialStickers() {
        return [
            { id: '1', sku: 'STK-001', name: "Sticker 'Code Life'", price: 2.50, category: 'otros', hashtags: '#programming #developer #code', description: 'Un sticker para los que viven y respiran código. Perfecto para tu laptop.', image: 'https://i.postimg.cc/rpJp8pM1/placeholder.png' },
            { id: '2', sku: 'STK-002', name: "Sticker 'Gato Café'", price: 3.00, category: 'otros', hashtags: '#cat #coffee #cute #animal', description: 'El compañero perfecto para tus mañanas de café y programación.', image: 'https://i.postimg.cc/rpJp8pM1/placeholder.png' },
            { id: '3', sku: 'STK-003', name: "Sticker 'JS Logo'", price: 2.00, category: 'otros', hashtags: '#javascript #webdev #programming #frontend', description: 'Muestra tu amor por el lenguaje que impulsa la web.', image: 'https://i.postimg.cc/rpJp8pM1/placeholder.png' },
            { id: '4', sku: 'STK-004', name: "Sticker 'CSS es Genial'", price: 2.00, category: 'otros', hashtags: '#css #webdesign #frontend #diseño', description: 'Dale estilo a tu vida con este sticker que celebra el poder de CSS.', image: 'https://i.postimg.cc/rpJp8pM1/placeholder.png' },
            { id: '5', sku: 'STK-005', name: "Sticker 'Goku'", price: 3.50, category: 'anime', hashtags: '#dragonball #dbz #saiyan #goku', description: 'Un sticker que demuestra un poder de más de 9000.', image: 'https://i.postimg.cc/rpJp8pM1/placeholder.png' },
            { id: '6', sku: 'STK-006', name: "Sticker 'Luffy'", price: 3.50, category: 'manga', hashtags: '#onepiece #pirate #anime #luffy', description: 'Para los que sueñan con convertirse en el Rey de los Piratas.', image: 'https://i.postimg.cc/rpJp8pM1/placeholder.png' },
            { id: '7', sku: 'STK-007', name: "Sticker 'Zelda'", price: 3.00, category: 'videojuegos', hashtags: '#legendofzelda #nintendo #gaming #link', description: '¡Es peligroso ir solo! Llévate este sticker.', image: 'https://i.postimg.cc/rpJp8pM1/placeholder.png' },
            { id: '8', sku: 'STK-008', name: "Sticker 'Spider-Man'", price: 3.00, category: 'comics', hashtags: '#marvel #spiderman #superhero #avengers', description: 'Un gran poder conlleva una gran responsabilidad... y un gran sticker.', image: 'https://i.postimg.cc/rpJp8pM1/placeholder.png' },
        ];
    }

    /**
     * Carga los stickers. Si no hay en localStorage, los lee del HTML como semilla.
     */
    function loadStickers() {
        const savedStickers = localStorage.getItem(STICKERS_STORAGE_KEY);
        // Si hay stickers guardados Y no están vacíos, los usamos.
        if (savedStickers && savedStickers !== '[]') {
            allStickers = JSON.parse(savedStickers);
        } else {
            // Si no hay stickers guardados, usamos la lista inicial.
            allStickers = getInitialStickers();
            saveStickers();
        }
    }

    /**
     * Guarda el catálogo de stickers en localStorage.
     */
    function saveStickers() {
        localStorage.setItem(STICKERS_STORAGE_KEY, JSON.stringify(allStickers));
    }

    /**
     * Refresca toda la UI de productos (grid principal y panel de admin).
     */
    function refreshAllProductsUI() {
        renderProductGrid();
        if (sessionStorage.getItem('isAdmin') === 'true') {
            renderAdminStickersList();
            renderAdminCommentsList();
        }
    }

    /**
     * Carga y guarda comentarios, votos y tiempo de espera desde/hacia localStorage.
     */
    function loadComments() {
        const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
        const savedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
        if (savedComments) {
            try {
                comments = JSON.parse(savedComments);
            } catch (e) {
                comments = [];
            }
        }
        if (savedVotes) {
            try {
                userVotes = JSON.parse(savedVotes);
            } catch (e) {
                userVotes = {};
            }
        }
    }
    
    function loadOwnedCommentIds() {
        const savedIds = localStorage.getItem(OWNED_COMMENTS_KEY);
        ownedCommentIds = savedIds ? JSON.parse(savedIds) : [];
    }
    function saveOwnedCommentIds() {
        localStorage.setItem(OWNED_COMMENTS_KEY, JSON.stringify(ownedCommentIds));
    }

    function saveComments() {
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    }

    function saveUserVotes() {
        localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(userVotes));
    }

    // --- Funciones Principales ---

    /**
     * Añade un producto al carrito o incrementa su cantidad.
     * @param {string} id - El ID del producto.
     * @param {string} name - El nombre del producto.
     * @param {number} price - El precio del producto.
     * @param {number} [quantity=1] - La cantidad a añadir.
     */
    function addProductToCart(id, name, price, quantity = 1) {
        if (cart[id]) {
            // Si el producto ya está en el carrito, incrementa la cantidad
            cart[id].quantity += quantity;
        } else {
            // Si es un producto nuevo, lo añade al carrito
            cart[id] = {
                name: name,
                price: price,
                quantity: quantity
            };
        }
        // Actualiza la interfaz de usuario del carrito
        saveCart();
        updateCartUI();
    }

    /**
     * Elimina un producto del carrito por completo, sin importar la cantidad.
     * @param {string} id - El ID del producto a eliminar.
     */
    function removeItemFromCart(id) {
        if (cart[id]) {
            // Elimina el producto del carrito directamente
            delete cart[id];

            // Actualiza la interfaz de usuario
            saveCart();
            updateCartUI();
        }
    }

    /**
     * Vacía el carrito por completo.
     */
    function clearCart() {
        // Pide confirmación al usuario
        if (confirm("¿Estás seguro de que quieres vaciar tu carrito?")) {
            cart = {};
            saveCart();
            updateCartUI();
        }
    }

    /**
     * Actualiza el HTML del carrito para reflejar el estado actual del objeto 'cart'.
     * Calcula el total y lo muestra.
     */
    function updateCartUI() {
        // Limpia la lista actual del carrito
        cartItemsList.innerHTML = '';
        
        let total = 0;

        // Recorre cada producto en el objeto 'cart'
        for (const id in cart) {
            const item = cart[id];
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            // Crea un nuevo elemento <li> para el producto
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>Bs ${itemTotal.toFixed(2)}</span>
                <button class="remove-item" data-id="${id}">X</button>
            `;
            
            // Añade el <li> a la lista <ul>
            cartItemsList.appendChild(li);
        }

        // Actualiza el texto del total
        cartTotalElement.textContent = `Bs ${total.toFixed(2)}`;
    }

    /**
     * Actualiza el resumen del pedido en la modal de checkout.
     */
    function updateCheckoutSummary() {
        const checkoutItemList = document.getElementById('checkout-item-list');
        const subtotalEl = document.getElementById('checkout-subtotal');
        const shippingEl = document.getElementById('checkout-shipping');
        const finalTotalEl = document.getElementById('checkout-final-total');

        checkoutItemList.innerHTML = '';
        let subtotal = 0;

        // Llenar la lista de productos
        for (const id in cart) {
            const item = cart[id];
            subtotal += item.price * item.quantity;
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.name} (x${item.quantity})</span> <span>Bs ${item.price.toFixed(2)}</span>`;
            checkoutItemList.appendChild(li);
        }

        // Calcular envío
        let shippingCost = 0;
        if (departmentSelect.value && departmentSelect.value !== 'Cochabamba') {
            shippingCost = 20;
        }

        const finalTotal = subtotal + shippingCost;

        // Actualizar los totales en la UI
        subtotalEl.textContent = `Bs ${subtotal.toFixed(2)}`;
        shippingEl.textContent = `Bs ${shippingCost.toFixed(2)}`;
        finalTotalEl.textContent = `Bs ${finalTotal.toFixed(2)}`;
    }

    /**
     * Renderiza la cuadrícula de productos principal a partir de los datos en `allStickers`.
     */
    function renderProductGrid() {
        productGrid.innerHTML = ''; // Limpia la cuadrícula
        allStickers.forEach(sticker => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = sticker.id;
            card.dataset.name = sticker.name;
            card.dataset.sku = sticker.sku;
            card.dataset.price = sticker.price;
            card.dataset.category = sticker.category;
            card.dataset.hashtags = sticker.hashtags;
            card.dataset.description = sticker.description;

            card.innerHTML = `
                <img src="${sticker.image}" alt="${sticker.name}">
                <h3>${sticker.name}</h3>
                <p class="price">Bs ${sticker.price.toFixed(2)}</p>
                <div class="quantity-selector card-quantity-selector">
                    <button class="quantity-btn" data-action="decrease">-</button>
                    <input type="number" class="quantity-input" value="1" min="1">
                    <button class="quantity-btn" data-action="increase">+</button>
                </div>
                <button class="add-to-cart">Añadir al Carrito</button>
            `;
            productGrid.appendChild(card);
        });
        // Re-aplica los filtros y búsqueda por si acaso
        updateProductVisibility();
    }

    /**
     * Renderiza la lista de stickers en el panel de administración.
     */
    function renderAdminStickersList() {
        const adminList = document.getElementById('admin-stickers-list');
        const searchTerm = adminStickerSearch.value.toLowerCase();

        // Filtra los stickers basándose en el término de búsqueda
        const filteredStickers = allStickers.filter(sticker => 
            sticker.name.toLowerCase().includes(searchTerm)
        );

        adminList.innerHTML = '';
        filteredStickers.forEach(sticker => {
            adminList.innerHTML += `
                <div class="admin-sticker-item">
                    <div class="admin-sticker-info">
                        <span>${sticker.name}</span>
                        <div>
                            <button class="admin-edit-btn" data-id="${sticker.id}">Editar</button>
                            <button class="admin-delete-btn" data-id="${sticker.id}">Eliminar</button>
                        </div>
                    </div>
                    <span class="sku">SKU: ${sticker.sku}</span>
                </div>
            `;
        });
    }

    /**
     * Renderiza la lista de comentarios en el DOM.
     */
    function renderComments() {
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';

            const userVote = userVotes[comment.id]; // 'like', 'dislike', or undefined
            const isOwned = ownedCommentIds.includes(comment.id);
            let editButtonHTML = '';
            let editedTagHTML = '';

            if (isOwned && !comment.edited) {
                editButtonHTML = `<button class="edit-btn" data-id="${comment.id}">Editar</button>`;
            }

            if (comment.edited) {
                editedTagHTML = `<span class="edited-tag">(editado)</span>`;
            }

            commentDiv.innerHTML = `
                <p class="comment-text">${comment.text} ${editedTagHTML}</p>
                ${comment.adminReply ? `<div style="background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107;"><strong>💬 Respuesta del Admin:</strong> ${comment.adminReply}</div>` : ''}
                <div class="comment-actions">
                    <button class="vote-btn like-btn ${userVote === 'like' ? 'voted-like' : ''}" data-id="${comment.id}" data-action="like">
                        👍 <span class="like-count">${comment.likes}</span>
                    </button>
                    <button class="vote-btn dislike-btn ${userVote === 'dislike' ? 'voted-dislike' : ''}" data-id="${comment.id}" data-action="dislike">
                        👎 <span class="dislike-count">${comment.dislikes}</span>
                    </button>
                    ${editButtonHTML}
                </div>
            `;
            commentsList.appendChild(commentDiv);
        });
    }

    /**
     * Maneja el envío de un nuevo comentario.
     */
    function handleAddComment(event) {
        event.preventDefault();
        const commentText = commentInput.value.trim();
        if (!commentText) return;

        const newComment = {
            id: Date.now(),
            text: commentText,
            likes: 0,
            dislikes: 0,
            edited: false, // Nueva propiedad para rastrear la edición
        };

        comments.unshift(newComment); // Añade el nuevo comentario al principio
        ownedCommentIds.push(newComment.id); // El usuario "posee" este comentario

        saveComments();
        saveOwnedCommentIds();
        renderComments();

        // Guarda el tiempo del comentario y deshabilita el formulario
        localStorage.setItem(LAST_COMMENT_TIME_KEY, Date.now());
        commentInput.value = '';
        checkCommentCooldown();
    }


    /**
     * Comprueba si el usuario puede comentar y actualiza la UI.
     */
    function checkCommentCooldown() {
        // Restricción eliminada: Aseguramos que el formulario siempre esté habilitado.
        submitCommentBtn.disabled = false;
        commentInput.disabled = false; // El input de texto permanece activo
        cooldownMsg.style.display = 'none'; // Oculta el mensaje por defecto

        const COOLDOWN_PERIOD = 12 * 60 * 60 * 1000; // 12 horas en milisegundos
        const lastCommentTime = localStorage.getItem(LAST_COMMENT_TIME_KEY);

        if (!lastCommentTime) {
            return; // Si nunca ha comentado, puede hacerlo.
        }

        const now = Date.now();
        const timeElapsed = now - parseInt(lastCommentTime, 10);
        const timeRemaining = COOLDOWN_PERIOD - timeElapsed;

        if (timeRemaining > 0) {
            submitCommentBtn.disabled = true;
            cooldownMsg.style.display = 'block';

            // Limpia cualquier intervalo anterior para evitar múltiples contadores
            if (cooldownInterval) clearInterval(cooldownInterval);

            const updateMessage = () => {
                const newTimeRemaining = COOLDOWN_PERIOD - (Date.now() - parseInt(lastCommentTime, 10));
                if (newTimeRemaining <= 0) {
                    clearInterval(cooldownInterval);
                    checkCommentCooldown(); // Vuelve a verificar para habilitar el botón
                } else {
                    const hours = Math.floor(newTimeRemaining / (1000 * 60 * 60));
                    const minutes = Math.floor((newTimeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((newTimeRemaining % (1000 * 60)) / 1000);

                    let timeString = '';
                    if (hours > 0) timeString += `${hours}h `;
                    if (minutes > 0 || hours > 0) timeString += `${minutes}m `;
                    timeString += `${seconds}s`;

                    cooldownMsg.textContent = `¡Gracias por tu entusiasmo! 💖 Podrás volver a comentar en ${timeString}.`;
                }
            };

            updateMessage(); // Llama una vez para mostrar el mensaje inmediatamente
            cooldownInterval = setInterval(updateMessage, 1000); // Actualiza cada segundo
        }
    }
    /**
     * Maneja los clics en los botones de like/dislike.
     */
    function handleVote(voteBtn) {
        const target = voteBtn;
        if (!target) return;

        const commentId = target.dataset.id;
        const action = target.dataset.action;
        const comment = comments.find(c => c.id == commentId);
        const currentVote = userVotes[commentId];

        if (!comment) return;

        // Lógica de voto: solo se puede votar una vez (like o dislike)
        if (currentVote === action) {
            // Si se hace clic en el mismo botón, se quita el voto
            delete userVotes[commentId];
            comment[action + 's']--; // Decrementa 'likes' o 'dislikes'
        } else {
            if (currentVote) {
                // Si ya había un voto, se quita el anterior
                comment[currentVote + 's']--;
            }
            // Se añade el nuevo voto
            userVotes[commentId] = action;
            comment[action + 's']++;
        }

        saveComments();
        saveUserVotes();
        renderComments();
    }

    /**
     * Permite al usuario editar su propio comentario una sola vez.
     */
    function handleEditComment(commentId) {
        const comment = comments.find(c => c.id == commentId);
        if (!comment || comment.edited) return; // No se puede editar si ya fue editado

        const newText = prompt("Edita tu comentario:", comment.text);

        // Si el usuario no cancela y el texto es diferente
        if (newText !== null && newText.trim() !== '' && newText !== comment.text) {
            comment.text = newText.trim();
            comment.edited = true; // Marcar como editado
            saveComments();
            renderComments();
        }
    }

    /**
     * Abre la modal de proceso de pago.
     */
    function openCheckoutModal() {
        if (Object.keys(cart).length === 0) {
            alert("Tu carrito está vacío. ¡Añade algunos stickers!");
            return;
        }
        // Actualiza el resumen del pedido antes de mostrar la modal
        updateCheckoutSummary();
        checkoutModal.style.display = 'flex';
    }

    /**
     * Cierra la modal de proceso de pago.
     */
    function closeCheckoutModal() {
        checkoutModal.style.display = 'none';
    }

    /**
     * Lógica de inicio de sesión de administrador.
     */
    function adminLogin() {
        const password = prompt("Ingresa la contraseña de administrador:");
        if (password === "admin123") { // ¡Cambia esta contraseña!
            alert("¡Bienvenido, Admin!");
            sessionStorage.setItem('isAdmin', 'true');
            openAdminPanel();
        } else {
            alert("Contraseña incorrecta.");
        }
    }

    function openAdminPanel() {
        renderAdminStickersList();
        renderAdminCommentsList();
        adminPanelModal.style.display = 'flex';
    }

    function closeAdminPanel() {
        adminPanelModal.style.display = 'none';
        resetAdminForm();
    }

    /**
     * Renderiza la lista de comentarios en el panel de administración con opciones de moderar.
     */
    function renderAdminCommentsList() {
        const adminCommentsList = document.getElementById('admin-comments-list');
        if (!adminCommentsList) return;

        adminCommentsList.innerHTML = '';

        if (comments.length === 0) {
            adminCommentsList.innerHTML = '<p style="text-align: center; color: #999;">No hay comentarios aún.</p>';
            return;
        }

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'admin-comment-item';

            commentDiv.innerHTML = `
                <p style="margin: 0 0 10px 0; font-size: 0.95em;"><strong>Comentario ID ${comment.id}:</strong></p>
                <p style="margin: 0 0 10px 0; line-height: 1.5;">${comment.text}</p>
                ${comment.adminReply ? `<div class="admin-reply-display"><strong>Tu respuesta:</strong> ${comment.adminReply} <button class="admin-edit-reply-btn" data-id="${comment.id}">Editar</button></div>` : ''}
                <div class="admin-comment-controls">
                    <button class="admin-reply-btn" data-id="${comment.id}">Responder</button>
                    <button class="admin-delete-comment-btn" data-id="${comment.id}">Eliminar</button>
                </div>
            `;
            adminCommentsList.appendChild(commentDiv);
        });
    }

    /**
     * Maneja la adición de un nuevo sticker desde el panel de admin.
     */
    function handleAddSticker(event) {
        event.preventDefault();
        const stickerIdToEdit = document.getElementById('sticker-edit-id').value;
        const skuValue = document.getElementById('sticker-sku').value.trim();

        // Verifica si el SKU ya existe (y no es el del sticker que se está editando)
        const isSkuDuplicate = allStickers.some(
            sticker => sticker.sku === skuValue && sticker.id !== stickerIdToEdit
        );

        if (isSkuDuplicate) {
            alert(`Error: El SKU "${skuValue}" ya está en uso. Por favor, elige uno único.`);
            return;
        }

        if (stickerIdToEdit) {
            // --- Modo Edición ---
            const sticker = allStickers.find(s => s.id === stickerIdToEdit);
            if (sticker) {
                sticker.sku = skuValue;
                sticker.name = document.getElementById('sticker-name').value;
                sticker.price = parseFloat(document.getElementById('sticker-price').value);
                sticker.category = document.getElementById('sticker-category').value;
                sticker.hashtags = document.getElementById('sticker-hashtags').value;
                sticker.description = document.getElementById('sticker-description').value;
                sticker.image = document.getElementById('sticker-image').value;
            }
        } else {
            // --- Modo Añadir ---
            const newSticker = {
                id: 'stk-' + Date.now(),
                sku: skuValue,
                name: document.getElementById('sticker-name').value,
                price: parseFloat(document.getElementById('sticker-price').value),
                category: document.getElementById('sticker-category').value,
                hashtags: document.getElementById('sticker-hashtags').value,
                description: document.getElementById('sticker-description').value,
                image: document.getElementById('sticker-image').value,
            };
            allStickers.push(newSticker);
        }

        saveStickers();
        refreshAllProductsUI();
        resetAdminForm();
    }

    /**
     * Rellena el formulario de admin con los datos de un sticker para editarlo.
     */
    function populateStickerFormForEdit(id) {
        const sticker = allStickers.find(s => s.id === id);
        if (!sticker) return;

        document.getElementById('sticker-edit-id').value = sticker.id;
        document.getElementById('sticker-sku').value = sticker.sku;
        document.getElementById('sticker-name').value = sticker.name;
        document.getElementById('sticker-price').value = sticker.price;
        document.getElementById('sticker-category').value = sticker.category;
        document.getElementById('sticker-hashtags').value = sticker.hashtags;
        document.getElementById('sticker-description').value = sticker.description;
        document.getElementById('sticker-image').value = sticker.image;

        document.getElementById('admin-form-title').textContent = 'Editar Sticker';
        document.getElementById('sticker-form-submit-btn').textContent = 'Actualizar Sticker';
    }

    function resetAdminForm() {
        addStickerForm.reset();
        document.getElementById('sticker-edit-id').value = '';
        document.getElementById('sticker-sku').value = '';
        document.getElementById('admin-form-title').textContent = 'Añadir Nuevo Sticker';
        document.getElementById('sticker-form-submit-btn').textContent = 'Añadir Sticker';
    }

    /**
     * Maneja la eliminación de un sticker desde el panel de admin.
     */
    function handleDeleteSticker(id) {
        if (confirm(`¿Seguro que quieres eliminar el sticker con ID: ${id}?`)) {
            allStickers = allStickers.filter(sticker => sticker.id !== id);
            saveStickers();
            refreshAllProductsUI();
        }
    }

    /**
     * Abre un prompt para que el admin edite su propia respuesta.
     */
    function handleAdminEditReply(commentId) {
        const comment = comments.find(c => c.id == commentId);
        if (!comment || !comment.adminReply) return;

        const newReply = prompt('Edita tu respuesta:', comment.adminReply);

        // Si el usuario no cancela y el texto no está vacío
        if (newReply !== null && newReply.trim() !== '') {
            comment.adminReply = newReply.trim();
            saveComments();
            refreshAllProductsUI(); // Refresca todas las vistas
        }
    }

    /**
     * Maneja la eliminación de un comentario desde el panel de admin.
     */
    function handleAdminDeleteComment(commentId) {
        if (confirm('¿Seguro que quieres eliminar este comentario?')) {
            comments = comments.filter(c => c.id != commentId);
            saveComments();
            renderComments();
            renderAdminCommentsList();
        }
    }

    /**
     * Abre un prompt para que el admin responda un comentario.
     */
    function handleAdminReplyComment(commentId) {
        const comment = comments.find(c => c.id == commentId);
        if (!comment) return;

        const adminReply = prompt('Escribe tu respuesta para este comentario:', comment.adminReply || '');
        if (adminReply !== null) { // El usuario no canceló
            comment.adminReply = adminReply.trim();
            saveComments();
            renderComments();
            renderAdminCommentsList();
        }
    }

    /**
     * Construye el mensaje y redirige a WhatsApp.
     */
    function redirectToWhatsApp(event) {
        event.preventDefault(); // Evita que el formulario se envíe de la forma tradicional

        // Recolectar datos del formulario
        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;
        const department = departmentSelect.value;
        const pickupLocationGroup = document.getElementById('pickup-location-group');
        let shippingCost = 0;
        let deliveryInfo = '';

        // Validar campos básicos
        if (!name || !phone || !department) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // --- Construir el resumen del pedido (versión "cute") ---
        let orderSummary = `🌸✨ ¡Hola! Quisiera hacer un pedido de stickers ✨🌸\n\n`;
        orderSummary += `Mi nombre es: *${name}* 💖\n`;
        orderSummary += `Mi celular es: *${phone}* 📱\n`;
        orderSummary += `Soy de: *${department}* 🗺️\n`;

        // Lógica de envío y recojo
        if (department === 'Cochabamba') {
            const pickupLocation = document.getElementById('pickup-location').value;
            deliveryInfo = `Lugar de Recojo: *${pickupLocation}* 📍\n`;
        } else {
            shippingCost = 20;
            deliveryInfo = `Costo de Envío: *Bs ${shippingCost.toFixed(2)}* 🚚\n`;
        }
        orderSummary += deliveryInfo;

        orderSummary += `\nEste es mi pedido súper especial:\n`;
        orderSummary += `-----------------------------------\n`;

        // Calcular total del carrito y total final
        let cartTotal = 0;
        for (const id in cart) {
            const item = cart[id];
            cartTotal += item.price * item.quantity;
            const product = allStickers.find(s => s.id === id) || { sku: 'N/A' };
            orderSummary += `🎨 *${item.name}* (x${item.quantity}) - SKU: ${product.sku}\n`;
        }
        const finalTotal = cartTotal + shippingCost;

        orderSummary += `-----------------------------------\n\n`;
        
        // Añadir subtotal y envío si aplica
        if (shippingCost > 0) {
            orderSummary += `Subtotal: Bs ${cartTotal.toFixed(2)}\n`;
            orderSummary += `Envío: Bs ${shippingCost.toFixed(2)}\n`;
        }

        orderSummary += `El total de mi compra es: *Bs ${finalTotal.toFixed(2)}* 🛍️\n\n`;
        orderSummary += `¡Muchas gracias! Espero con ansias mis stickers. (｡♥‿♥｡)`;


        // Formatear el mensaje para la URL de WhatsApp
        const whatsappMessage = encodeURIComponent(orderSummary);
        const whatsappNumber = "+59172722999";
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

        // Limpiar el carrito y la UI
        cart = {};
        saveCart();
        updateCartUI();
        checkoutForm.reset();
        closeCheckoutModal();
        pickupLocationGroup.classList.remove('visible'); // Oculta el campo de recojo al cerrar

        // Redirigir a WhatsApp
        window.open(whatsappURL, '_blank');
    }

    /**
     * Filtra y muestra los productos según la categoría activa y el término de búsqueda.
     */
    function updateProductVisibility() {
        // Obtener el término de búsqueda y la categoría activa
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategoryButton = categoryFilters.querySelector('.filter-btn.active');
        const activeCategory = activeCategoryButton.dataset.category;

        const productCards = productGrid.querySelectorAll('.product-card');

        productCards.forEach(card => {
            // Obtener datos de la tarjeta
            const cardCategory = card.dataset.category;
            const cardName = card.dataset.name.toLowerCase();
            const cardHashtags = card.dataset.hashtags.toLowerCase();

            // 1. Comprobar si la categoría coincide
            const categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;

            // 2. Comprobar si el término de búsqueda coincide con nombre, categoría o hashtags
            const searchMatch = cardName.includes(searchTerm) || 
                                cardCategory.toLowerCase().includes(searchTerm) || 
                                cardHashtags.includes(searchTerm);

            // El producto se muestra si cumple AMBAS condiciones
            if (categoryMatch && searchMatch) {
                card.style.display = 'block'; // Mostrar tarjeta
            } else {
                card.style.display = 'none';  // Ocultar tarjeta
            }
        });
    }

    /**
     * Abre el modal y lo llena con la información del producto.
     * @param {HTMLElement} card - La tarjeta del producto que fue clickeada.
     */
    function openProductModal(card) {
        // Extraer datos de la tarjeta
        const name = card.dataset.name;
        const description = card.dataset.description;
        const price = parseFloat(card.dataset.price);
        const hashtags = card.dataset.hashtags.split(' ');
        const imgSrc = card.querySelector('img').src;
        const sku = card.dataset.sku;
        const id = card.dataset.id;

        // Poblar el modal con los datos
        modal.querySelector('#modal-name').textContent = name;
        modal.querySelector('#modal-description').textContent = description;
        modal.querySelector('#modal-price').textContent = `Bs ${price.toFixed(2)}`;
        modal.querySelector('#modal-sku').textContent = `SKU: ${sku}`;
        modal.querySelector('#modal-img').src = imgSrc;

        // Generar y mostrar hashtags
        const hashtagsContainer = modal.querySelector('#modal-hashtags');
        hashtagsContainer.innerHTML = ''; // Limpiar hashtags anteriores
        hashtags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.textContent = tag;
            hashtagsContainer.appendChild(tagElement);
        });

        // Guardar el ID del producto en el botón del modal para poder añadirlo al carrito
        modalAddToCartBtn.dataset.id = id;
        modalAddToCartBtn.dataset.name = name;
        modalAddToCartBtn.dataset.price = price;

        // Mostrar el modal
        modal.style.display = 'flex';

        // Reiniciar la cantidad del modal a 1 cada vez que se abre
        modalQuantityInput.value = 1;
    }

    /**
     * Cierra el modal de detalles del producto.
     */
    function closeProductModal() {
        modal.style.display = 'none';
    }

    

    // --- Asignación de Eventos ---

    function handleProductCardClick(event) {
        // Verifica si el clic fue en un botón con la clase 'add-to-cart'
        const target = event.target;
        const card = target.closest('.product-card');

        if (!card) return; // Si el clic no fue dentro de una tarjeta, no hacer nada

        if (!card) return; // Si el clic no fue dentro de una tarjeta, no hacer nada

        if (!card) return; // Si el clic no fue dentro de una tarjeta, no hacer nada

        if (target.classList.contains('add-to-cart')) {
            // --- Lógica para Añadir al Carrito desde la TARJETA ---

            // Obtiene los datos del producto desde los atributos data-*
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseFloat(card.dataset.price);
            // Encuentra el input de cantidad DENTRO de la tarjeta específica
            const quantityInput = card.querySelector('.quantity-input');
            const quantity = parseInt(quantityInput.value, 10);

            addProductToCart(id, name, price, quantity);
            // Resetea el contador de la tarjeta a 1 después de añadir
            quantityInput.value = 1;

            // --- Lógica de la Animación ---

            // 1. Obtener elementos y posiciones
            const productImage = card.querySelector('img');
            const productImageRect = productImage.getBoundingClientRect(); // Posición de la imagen original
            const cartElement = document.querySelector('.cart');
            const cartRect = cartElement.getBoundingClientRect(); // Posición del carrito

            // 2. Crear un clon de la imagen para animar
            const flyingImage = productImage.cloneNode();
            flyingImage.classList.add('product-image-fly');

            // 3. Establecer la posición inicial del clon (encima de la imagen original)
            flyingImage.style.top = `${productImageRect.top}px`;
            flyingImage.style.left = `${productImageRect.left}px`;
            flyingImage.style.width = `${productImageRect.width}px`;
            flyingImage.style.height = `${productImageRect.height}px`;

            // 4. Añadir el clon al body para que se pueda mover libremente
            document.body.appendChild(flyingImage);

            // 5. Forzar al navegador a aplicar los estilos iniciales antes de animar
            requestAnimationFrame(() => {
                // 6. Establecer la posición final del clon (en el centro del carrito)
                flyingImage.style.top = `${cartRect.top + cartRect.height / 2}px`;
                flyingImage.style.left = `${cartRect.left + cartRect.width / 2}px`;
                flyingImage.style.width = '0px'; // Encoger la imagen
                flyingImage.style.height = '0px';
                flyingImage.style.opacity = '0'; // Desvanecer la imagen
            });

            // 7. Limpiar: eliminar el clon del DOM después de que termine la animación
            flyingImage.addEventListener('transitionend', () => {
                flyingImage.remove();
            });

        } else if (target.tagName === 'IMG' || target.tagName === 'H3') {
            // --- Lógica para Abrir el Modal ---
            openProductModal(card);
        } else if (target.classList.contains('quantity-btn')) {
            // --- Lógica para los botones de cantidad en la TARJETA ---
            const action = target.dataset.action;
            const quantityInput = card.querySelector('.quantity-input');
            let currentValue = parseInt(quantityInput.value, 10);

            if (action === 'increase') {
                quantityInput.value = currentValue + 1;
            } else if (action === 'decrease' && currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        }
    }

    // Usamos delegación de eventos en los contenedores de productos
    productGrid.addEventListener('click', handleProductCardClick);

    // Evento para los botones "Eliminar" (X)
    // Usamos delegación de eventos en la lista del carrito
    cartItemsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item')) {
            const id = event.target.dataset.id;
            removeItemFromCart(id);
        }
    });

    // Evento para el botón "Pagar"
    checkoutButton.addEventListener('click', openCheckoutModal);

    // Evento para los botones de filtro de categoría
    categoryFilters.addEventListener('click', (event) => {
        if (event.target.classList.contains('filter-btn')) {
            // Quita la clase 'active' del botón anterior
            const currentActive = categoryFilters.querySelector('.active');
            currentActive.classList.remove('active');
            // Añade 'active' al botón presionado
            event.target.classList.add('active');
            
            // Actualiza la visibilidad de los productos
            updateProductVisibility();
        }
    });

    // Evento para la barra de búsqueda (se activa mientras el usuario escribe)
    searchInput.addEventListener('input', updateProductVisibility);

    // Eventos para cerrar el modal
    modalCloseBtn.addEventListener('click', closeProductModal);
    modal.addEventListener('click', (event) => {
        // Cierra el modal si se hace clic en el fondo oscuro (overlay)
        if (event.target === modal) {
            closeProductModal();
        }
    });

    // Eventos para la modal de checkout
    checkoutModalCloseBtn.addEventListener('click', closeCheckoutModal);
    checkoutModal.addEventListener('click', (event) => {
        if (event.target === checkoutModal) {
            closeCheckoutModal();
        }
    });
    checkoutForm.addEventListener('submit', redirectToWhatsApp);

    // Evento para mostrar/ocultar el campo de lugar de recojo
    departmentSelect.addEventListener('change', () => {
        const pickupLocationGroup = document.getElementById('pickup-location-group');
        if (departmentSelect.value === 'Cochabamba') {
            pickupLocationGroup.classList.add('visible');
            updateCheckoutSummary(); // Recalcula el total sin envío
        } else {
            pickupLocationGroup.classList.remove('visible');
            updateCheckoutSummary(); // Recalcula el total con envío
        }
    });

    // Eventos del panel de administración
    adminLoginBtn.addEventListener('click', adminLogin);
    adminPanelCloseBtn.addEventListener('click', closeAdminPanel);
    addStickerForm.addEventListener('submit', handleAddSticker);
    adminPanelModal.addEventListener('click', (event) => {
        // Cierra el panel si se hace clic en el fondo
        if (event.target === adminPanelModal) {
            closeAdminPanel();
        }
        // Maneja los botones de la lista de stickers en admin
        if (event.target.classList.contains('admin-delete-btn')) {
            handleDeleteSticker(event.target.dataset.id);
        } else if (event.target.classList.contains('admin-edit-btn')) {
            populateStickerFormForEdit(event.target.dataset.id);
        }
        // Maneja los botones de moderación de comentarios
        if (event.target.classList.contains('admin-delete-comment-btn')) {
            handleAdminDeleteComment(event.target.dataset.id);
        } else if (event.target.classList.contains('admin-reply-btn')) {
            handleAdminReplyComment(event.target.dataset.id);
        } else if (event.target.classList.contains('admin-edit-reply-btn')) {
            handleAdminEditReply(event.target.dataset.id);
        }
    });

    // Evento para la barra de búsqueda del panel de admin
    adminStickerSearch.addEventListener('input', renderAdminStickersList);

    // Evento para el botón "Vaciar Carrito"
    clearCartButton.addEventListener('click', clearCart);

    // Evento para el botón "Añadir al Carrito" DENTRO del modal
    modalAddToCartBtn.addEventListener('click', (event) => {
        const { id, name, price } = event.target.dataset;
        const quantity = parseInt(modalQuantityInput.value, 10);
        addProductToCart(id, name, parseFloat(price), quantity);
        closeProductModal(); // Opcional: cerrar el modal después de añadir
    });

    // Eventos para los botones de cantidad del modal
    modal.addEventListener('click', (event) => {
        if (event.target.classList.contains('quantity-btn')) {
            const action = event.target.dataset.action;
            let currentValue = parseInt(modalQuantityInput.value, 10);

            if (action === 'increase') {
                modalQuantityInput.value = currentValue + 1;
            } else if (action === 'decrease' && currentValue > 1) {
                modalQuantityInput.value = currentValue - 1;
            }
        }
    });

    // Evento para el formulario de comentarios
    commentForm.addEventListener('submit', handleAddComment);

    // Evento para los botones de like/dislike
    commentsList.addEventListener('click', (event) => {
        const voteBtn = event.target.closest('.vote-btn');
        const editBtn = event.target.closest('.edit-btn');

        if (voteBtn) {
            handleVote(voteBtn);
        } else if (editBtn) {
            handleEditComment(editBtn.dataset.id);
        }
    });

    // --- Inicialización ---
    // Carga el carrito guardado al iniciar y actualiza la UI.
    loadStickers();
    loadCart();
    loadOwnedCommentIds();
    renderProductGrid();
    updateCartUI();
    // Carga y muestra los comentarios
    loadComments();
    renderComments();
    // Comprueba si el usuario puede comentar
    checkCommentCooldown();
});