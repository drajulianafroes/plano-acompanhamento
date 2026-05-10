const planDefaults = [
  { dose: "2,5 mg", mg: 2.5, price: 2000 },
  { dose: "5,0 mg", mg: 5, price: 2380 },
  { dose: "7,5 mg", mg: 7.5, price: 2900 },
  { dose: "10 mg", mg: 10, price: 3300 },
  { dose: "12,5 mg", mg: 12.5, price: 3800 },
  { dose: "15,0 mg", mg: 15, price: 4035 },
];

const baseCostPerApplication = 63.75;
const applicationsPerMonth = 4;

const defaults = {
  nutritionPrice: 200,
  duration: 1,
  nutritionFrequency: 1,
  cardFeeRate: 3.34,
  taxRate: 15,
  discountRate: 0,
};

let selectedPlanIndexes = [0];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const elements = {
  form: document.querySelector("#calculatorForm"),
  nutritionPrice: document.querySelector("#nutritionPrice"),
  discountRate: document.querySelector("#discountRate"),
  cardFeeRate: document.querySelector("#cardFeeRate"),
  taxRate: document.querySelector("#taxRate"),
  durationSelect: document.querySelector("#durationSelect"),
  nutritionFrequency: document.querySelector("#nutritionFrequency"),
  monthPlans: document.querySelector("#monthPlans"),
  resetButton: document.querySelector("#resetButton"),
  totalRevenue: document.querySelector("#totalRevenue"),
  totalContext: document.querySelector("#totalContext"),
  monthlyRevenue: document.querySelector("#monthlyRevenue"),
  netResult: document.querySelector("#netResult"),
  expenseTotal: document.querySelector("#expenseTotal"),
  netMargin: document.querySelector("#netMargin"),
  planRevenueBreakdown: document.querySelector("#planRevenueBreakdown"),
  discountBreakdown: document.querySelector("#discountBreakdown"),
  medicationExpenseBreakdown: document.querySelector("#medicationExpenseBreakdown"),
  nutritionExpenseBreakdown: document.querySelector("#nutritionExpenseBreakdown"),
  cardFeeBreakdown: document.querySelector("#cardFeeBreakdown"),
  taxBreakdown: document.querySelector("#taxBreakdown"),
};

function numericValue(input) {
  const value = Number(input.value);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function countVisits(months, frequency) {
  const safeFrequency = Math.max(1, frequency);
  return Math.ceil(months / safeFrequency);
}

function getMonthCount() {
  return Math.max(1, Number(elements.durationSelect.value));
}

function createPlanOption(plan, index) {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = `${plan.dose} - ${currency.format(plan.price)}`;
  return option;
}

function renderMonthPlans() {
  const months = getMonthCount();
  const previousPlan = selectedPlanIndexes[selectedPlanIndexes.length - 1] ?? 0;

  selectedPlanIndexes = Array.from({ length: months }, (_, index) => {
    return selectedPlanIndexes[index] ?? previousPlan;
  });

  elements.monthPlans.replaceChildren();

  selectedPlanIndexes.forEach((planIndex, monthIndex) => {
    const label = document.createElement("label");
    label.className = "field month-plan";

    const title = document.createElement("span");
    title.textContent = `Mes ${monthIndex + 1}`;

    const select = document.createElement("select");
    select.dataset.monthIndex = String(monthIndex);

    planDefaults.forEach((plan, index) => {
      select.append(createPlanOption(plan, index));
    });

    select.value = String(planIndex);
    select.addEventListener("change", (event) => {
      selectedPlanIndexes[monthIndex] = Number(event.target.value);
      calculate();
    });

    label.append(title, select);
    elements.monthPlans.append(label);
  });
}

function calculate() {
  const months = getMonthCount();
  const nutritionPrice = numericValue(elements.nutritionPrice);
  const discountRate = months > 1 ? numericValue(elements.discountRate) / 100 : 0;
  const cardFeeRate = numericValue(elements.cardFeeRate) / 100;
  const taxRate = numericValue(elements.taxRate) / 100;
  const nutritionFrequency = Math.max(1, Number(elements.nutritionFrequency.value));
  const selectedPlans = selectedPlanIndexes.map((index) => planDefaults[index] ?? planDefaults[0]);

  const nutritionVisits = countVisits(months, nutritionFrequency);
  const grossRevenue = selectedPlans.reduce((sum, plan) => sum + plan.price, 0);
  const discountAmount = grossRevenue * discountRate;
  const totalRevenue = grossRevenue - discountAmount;

  const medicationExpense = selectedPlans.reduce((sum, plan) => {
    const costPerApplication = baseCostPerApplication * (plan.mg / 2.5);
    return sum + applicationsPerMonth * costPerApplication;
  }, 0);
  const nutritionExpense = nutritionVisits * nutritionPrice;
  const cardFeeExpense = totalRevenue * cardFeeRate;
  const taxExpense = totalRevenue * taxRate;
  const totalExpense = nutritionExpense + medicationExpense + cardFeeExpense + taxExpense;
  const netResult = totalRevenue - totalExpense;
  const netMargin = totalRevenue > 0 ? netResult / totalRevenue : 0;
  const planSummary = selectedPlans
    .map((plan, index) => `M${index + 1}: ${plan.dose}`)
    .join(" + ");

  elements.discountRate.disabled = months === 1;
  elements.totalRevenue.textContent = currency.format(totalRevenue);
  elements.totalContext.textContent = `para ${months} ${months === 1 ? "mes" : "meses"}`;
  elements.monthlyRevenue.textContent = currency.format(totalRevenue / months);
  elements.netResult.textContent = currency.format(netResult);
  elements.expenseTotal.textContent = currency.format(totalExpense);
  elements.netMargin.textContent = percent.format(netMargin);
  elements.planRevenueBreakdown.textContent = `${planSummary} = ${currency.format(grossRevenue)}`;
  elements.discountBreakdown.textContent = currency.format(discountAmount);
  elements.medicationExpenseBreakdown.textContent = currency.format(medicationExpense);
  elements.nutritionExpenseBreakdown.textContent =
    `${nutritionVisits} x ${currency.format(nutritionPrice)}`;
  elements.cardFeeBreakdown.textContent = currency.format(cardFeeExpense);
  elements.taxBreakdown.textContent = currency.format(taxExpense);
}

function handleDurationChange() {
  renderMonthPlans();
  calculate();
}

function resetForm() {
  selectedPlanIndexes = [0];
  elements.nutritionPrice.value = defaults.nutritionPrice;
  elements.durationSelect.value = defaults.duration;
  elements.nutritionFrequency.value = defaults.nutritionFrequency;
  elements.cardFeeRate.value = defaults.cardFeeRate;
  elements.taxRate.value = defaults.taxRate;
  elements.discountRate.value = defaults.discountRate;
  renderMonthPlans();
  calculate();
}

elements.durationSelect.addEventListener("change", handleDurationChange);
elements.form.addEventListener("input", calculate);
elements.form.addEventListener("change", calculate);
elements.resetButton.addEventListener("click", resetForm);

resetForm();
