(function (window) {
  var STORAGE_KEY = 'qualiportes_cart_v1';
  var WHATSAPP_NUMBER = '221770642521';

  function fmtFCFA(n) {
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function save(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
    updateBadges();
  }

  function count(cart) {
    cart = cart || load();
    return Object.keys(cart).reduce(function (sum, k) { return sum + cart[k].qty; }, 0);
  }

  function total(cart) {
    cart = cart || load();
    return Object.keys(cart).reduce(function (sum, k) { return sum + cart[k].qty * cart[k].price; }, 0);
  }

  function add(name, price, image, delta) {
    var cart = load();
    if (!cart[name]) cart[name] = { name: name, price: price, image: image || '', qty: 0 };
    cart[name].qty = Math.max(0, Math.min(99, cart[name].qty + delta));
    if (cart[name].qty === 0) delete cart[name];
    save(cart);
    return cart;
  }

  function setQty(name, qty) {
    var cart = load();
    if (!cart[name]) return cart;
    cart[name].qty = Math.max(0, Math.min(99, qty));
    if (cart[name].qty === 0) delete cart[name];
    save(cart);
    return cart;
  }

  function remove(name) {
    var cart = load();
    delete cart[name];
    save(cart);
    return cart;
  }

  function clear() {
    save({});
  }

  function whatsappMessage(cart) {
    cart = cart || load();
    var keys = Object.keys(cart);
    var lines = keys.map(function (k) {
      var item = cart[k];
      return '- ' + item.qty + ' x ' + item.name + ' = ' + fmtFCFA(item.qty * item.price);
    });
    return 'Bonjour, je souhaite ce devis :\n' + lines.join('\n') + '\nTotal : ' + fmtFCFA(total(cart));
  }

  function whatsappUrl(cart) {
    cart = cart || load();
    if (Object.keys(cart).length === 0) {
      return 'https://wa.me/' + WHATSAPP_NUMBER;
    }
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(whatsappMessage(cart));
  }

  function updateBadges() {
    var c = count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = c;
    });
    document.querySelectorAll('[data-cart-badge]').forEach(function (el) {
      el.hidden = c === 0;
    });
    document.querySelectorAll('[data-cart-empty-hint]').forEach(function (el) {
      el.hidden = c > 0;
    });
  }

  window.QualiCart = {
    WHATSAPP_NUMBER: WHATSAPP_NUMBER,
    fmtFCFA: fmtFCFA,
    load: load,
    save: save,
    count: count,
    total: total,
    add: add,
    setQty: setQty,
    remove: remove,
    clear: clear,
    whatsappUrl: whatsappUrl,
    whatsappMessage: whatsappMessage,
    updateBadges: updateBadges
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateBadges);
  } else {
    updateBadges();
  }

  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) updateBadges();
  });
})(window);
