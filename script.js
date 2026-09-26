const merchantInput = document.getElementById('merchantUpi');
const defaultNoteInput = document.getElementById('defaultNote');
const customerList = document.getElementById('customerList');
const resultsContainer = document.getElementById('results');
const customerCountBadge = document.getElementById('customerCount');
const customerTemplate = document.getElementById('customerTemplate');

function createCustomerRow(data = {}) {
  const fragment = customerTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.customer-row');
  const nameInput = row.querySelector('.customer-name');
  const amountInput = row.querySelector('.customer-amount');
  const upiInput = row.querySelector('.customer-upi');
  const noteInput = row.querySelector('.customer-note');
  const removeButton = row.querySelector('.remove-btn');
  const rowNumber = row.querySelector('.row-number');

  nameInput.value = data.name || '';
  amountInput.value = data.amount || '';
  upiInput.value = data.upi || '';
  noteInput.value = data.note || '';

  const index = customerList.children.length + 1;
  rowNumber.textContent = `Customer ${index}`;

  removeButton.addEventListener('click', () => {
    row.remove();
    syncRowNumbers();
    updateCustomerCount();
  });

  customerList.appendChild(row);
  updateCustomerCount();
}

function syncRowNumbers() {
  [...customerList.children].forEach((row, idx) => {
    const rowNumber = row.querySelector('.row-number');
    rowNumber.textContent = `Customer ${idx + 1}`;
  });
}

function updateCustomerCount() {
  customerCountBadge.textContent = String(customerList.children.length);
}

function getCustomerData() {
  return [...customerList.children].map((row) => ({
    name: row.querySelector('.customer-name').value.trim(),
    amount: row.querySelector('.customer-amount').value.trim(),
    upi: row.querySelector('.customer-upi').value.trim(),
    note: row.querySelector('.customer-note').value.trim(),
  }));
}

function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.00';
  return num.toFixed(2);
}

function buildUpiLink({ merchantUpi, name, amount, upi, note }) {
  const payeeUpi = (upi || merchantUpi || '').trim();
  const safeName = (name || 'Customer').trim() || 'Customer';
  const safeAmount = formatCurrency(amount);
  const safeNote = (note || defaultNoteInput.value || 'Repayment').trim() || 'Repayment';

  const params = new URLSearchParams();
  params.set('pa', payeeUpi);
  params.set('pn', safeName);
  params.set('am', safeAmount);
  params.set('cu', 'INR');
  params.set('tn', safeNote);

  return `upi://pay?${params.toString()}`;
}

function renderResults() {
  const merchantUpi = merchantInput.value.trim();
  const customerData = getCustomerData();

  if (!merchantUpi) {
    resultsContainer.innerHTML = '<div class="empty-state">Please enter your UPI ID to generate links.</div>';
    return;
  }

  const validCustomers = customerData.filter((customer) => customer.name || customer.amount || customer.note || customer.upi);

  if (!validCustomers.length) {
    resultsContainer.innerHTML = '<div class="empty-state">Add at least one customer to generate repayment links.</div>';
    return;
  }

  resultsContainer.innerHTML = validCustomers
    .map((customer) => {
      const safeAmount = formatCurrency(customer.amount || 0);
      const link = buildUpiLink({
        merchantUpi,
        name: customer.name,
        amount: customer.amount,
        upi: customer.upi,
        note: customer.note,
      });

      const displayName = customer.name || 'Customer';
      const displayNote = customer.note || defaultNoteInput.value || 'Repayment';

      return `
        <article class="result-card">
          <h3>${displayName}</h3>
          <p class="meta">₹ ${safeAmount} • ${displayNote}</p>
          <div class="link-box">${link}</div>
          <div class="action-row">
            <button class="copy-btn" type="button" data-link="${link}">Copy</button>
            <a class="open-btn" href="${link}" target="_blank" rel="noopener noreferrer">Open</a>
          </div>
        </article>
      `;
    })
    .join('');

  document.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const link = button.dataset.link;
      try {
        await navigator.clipboard.writeText(link);
        const originalText = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1200);
      } catch (error) {
        button.textContent = 'Failed';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 1200);
      }
    });
  });
}

function copyAllLinks() {
  const merchantUpi = merchantInput.value.trim();
  if (!merchantUpi) {
    alert('Please enter your UPI ID first.');
    return;
  }

  const customerData = getCustomerData().filter((customer) => customer.name || customer.amount || customer.note || customer.upi);
  if (!customerData.length) {
    alert('Add at least one customer before copying links.');
    return;
  }

  const lines = customerData.map((customer, idx) => `${customer.name || `Customer ${idx + 1}`} - ${buildUpiLink({ merchantUpi, ...customer })}`).join('\n');

  navigator.clipboard.writeText(lines)
    .then(() => alert('All links copied to clipboard.'))
    .catch(() => alert('Clipboard access failed. Please copy manually.'));
}

function downloadJson() {
  const merchantUpi = merchantInput.value.trim();
  const customerData = getCustomerData().filter((customer) => customer.name || customer.amount || customer.note || customer.upi);

  if (!merchantUpi || !customerData.length) {
    alert('Please add customer details and a valid UPI ID.');
    return;
  }

  const payload = customerData.map((customer) => ({
    name: customer.name || 'Customer',
    amount: customer.amount || '0',
    upi: customer.upi || merchantUpi,
    note: customer.note || defaultNoteInput.value || 'Repayment',
    link: buildUpiLink({ merchantUpi, ...customer }),
  }));

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'upi-repayment-links.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

document.getElementById('addCustomer').addEventListener('click', () => {
  createCustomerRow();
});

document.getElementById('generateLinks').addEventListener('click', renderResults);
document.getElementById('copyAll').addEventListener('click', copyAllLinks);
document.getElementById('downloadJson').addEventListener('click', downloadJson);

createCustomerRow({
  name: 'Amit Kumar',
  amount: '2500',
  note: 'Repayment for invoice 102',
});

createCustomerRow({
  name: 'Priya Singh',
  amount: '1800',
  note: 'Repayment for invoice 205',
});

renderResults();
