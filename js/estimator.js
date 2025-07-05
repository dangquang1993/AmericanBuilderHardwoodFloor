// Hardwood Floor Installation Cost Estimator
document.addEventListener('DOMContentLoaded', function() {
    // Estimator variables
    let currentStep = 1;
    const totalSteps = 4;
    let estimateData = {
        rooms: [],
        woodType: '',
        installationType: '',
        additionalServices: [],
        customerInfo: {}
    };

    // Cost calculations (per square foot)
    const woodTypeCosts = {
        'oak': 8.50,
        'maple': 9.25,
        'cherry': 12.75,
        'walnut': 15.50,
        'hickory': 10.25,
        'bamboo': 6.75,
        'engineered': 7.25
    };

    const installationCosts = {
        'standard': 4.50,
        'diagonal': 6.00,
        'herringbone': 8.50,
        'parquet': 7.25
    };

    const additionalServiceCosts = {
        'subfloor': 3.50,
        'removal': 2.25,
        'baseboards': 4.75,
        'stairs': 125.00, // per step
        'transitions': 85.00 // per piece
    };

    // Unit system variables
    let currentUnit = 'imperial'; // 'imperial' or 'metric'
    
    // Conversion constants
    const METERS_TO_FEET = 3.28084;
    const SQM_TO_SQFT = 10.7639;
    
    // Initialize estimator
    initializeEstimator();

    function initializeEstimator() {
        showStep(1);
        setupEventListeners();
        updateProgressBar();
        updateUnitLabels();
    }

    function setupEventListeners() {
        // Room calculation for single room interface
        const roomLength = document.getElementById('room-length');
        const roomWidth = document.getElementById('room-width');
        const squareFootage = document.getElementById('square-footage');
        const directArea = document.getElementById('direct-area');
        
        if (roomLength && roomWidth && squareFootage) {
            roomLength.addEventListener('input', calculateSquareFootage);
            roomWidth.addEventListener('input', calculateSquareFootage);
        }
        
        if (directArea && squareFootage) {
            directArea.addEventListener('input', handleDirectAreaInput);
        }

        // Room form submission (for multi-room interface if present)
        document.getElementById('addRoom')?.addEventListener('click', addRoom);
        
        // Navigation buttons
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', nextStep);
        });
        
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', prevStep);
        });

        // Final form submission
        document.getElementById('submitEstimate')?.addEventListener('click', submitEstimate);
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        // Wood type selection
        document.querySelectorAll('input[name="wood-type"]').forEach(radio => {
            radio.addEventListener('change', updateWoodTypeSelection);
        });

        // Installation type selection
        document.querySelectorAll('input[name="installationType"]').forEach(radio => {
            radio.addEventListener('change', updateInstallationTypeSelection);
        });

        // Additional services checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateAdditionalServices);
        });

        // Unit toggle buttons
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const unit = this.getAttribute('data-unit');
                toggleUnit(unit);
            });
        });
    }

    function handleDirectAreaInput() {
        const directArea = document.getElementById('direct-area');
        const squareFootage = document.getElementById('square-footage');
        const roomLength = document.getElementById('room-length');
        const roomWidth = document.getElementById('room-width');
        
        if (directArea.value && parseFloat(directArea.value) > 0) {
            // Clear length and width inputs when using direct area
            roomLength.value = '';
            roomWidth.value = '';
            
            // Set the total area
            const area = parseFloat(directArea.value);
            squareFootage.value = area.toFixed(currentUnit === 'metric' ? 2 : 1);
            
            // Enable next button
            const nextBtn = document.querySelector('#step1 .btn-primary');
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        } else {
            // If direct area is cleared, clear the total area too
            squareFootage.value = '';
            
            // Disable next button unless length/width have values
            updateNextButtonState();
        }
    }

    function calculateSquareFootage() {
        const length = parseFloat(document.getElementById('room-length').value) || 0;
        const width = parseFloat(document.getElementById('room-width').value) || 0;
        const squareFootage = document.getElementById('square-footage');
        const directArea = document.getElementById('direct-area');
        
        if (length > 0 && width > 0) {
            // Clear direct area input when using length/width
            if (directArea) {
                directArea.value = '';
            }
            
            let totalArea;
            
            if (currentUnit === 'metric') {
                // Calculate in square meters
                totalArea = length * width;
            } else {
                // Calculate in square feet
                totalArea = length * width;
            }
            
            squareFootage.value = totalArea.toFixed(currentUnit === 'metric' ? 2 : 1);
            
            // Enable next button
            const nextBtn = document.querySelector('#step1 .btn-primary');
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        } else {
            // Only clear if direct area is also empty
            if (!directArea || !directArea.value) {
                squareFootage.value = '';
            }
            
            updateNextButtonState();
        }
    }

    function updateNextButtonState() {
        const squareFootage = document.getElementById('square-footage');
        const nextBtn = document.querySelector('#step1 .btn-primary');
        
        if (nextBtn) {
            const hasValidArea = squareFootage.value && parseFloat(squareFootage.value) > 0;
            nextBtn.disabled = !hasValidArea;
        }
    }

    function addRoom() {
        const length = parseFloat(document.getElementById('roomLength').value);
        const width = parseFloat(document.getElementById('roomWidth').value);
        const name = document.getElementById('roomName').value || `Room ${estimateData.rooms.length + 1}`;

        if (length && width && length > 0 && width > 0) {
            const room = {
                name: name,
                length: length,
                width: width,
                area: length * width
            };

            estimateData.rooms.push(room);
            updateRoomsList();
            clearRoomForm();
        } else {
            alert('Please enter valid room dimensions (greater than 0).');
        }
    }

    function updateRoomsList() {
        const roomsList = document.getElementById('roomsList');
        const totalArea = document.getElementById('totalArea');
        
        if (!roomsList) return;

        let totalSqFt = 0;
        let roomsHTML = '';

        estimateData.rooms.forEach((room, index) => {
            totalSqFt += room.area;
            roomsHTML += `
                <div class="room-item">
                    <div class="room-info">
                        <strong>${room.name}</strong><br>
                        ${room.length}' × ${room.width}' = ${room.area.toFixed(1)} sq ft
                    </div>
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeRoom(${index})">
                        Remove
                    </button>
                </div>
            `;
        });

        roomsList.innerHTML = roomsHTML;
        if (totalArea) {
            totalArea.textContent = totalSqFt.toFixed(1);
        }

        // Enable/disable next button
        const nextBtn = document.querySelector('#step1 .next-step');
        if (nextBtn) {
            nextBtn.disabled = estimateData.rooms.length === 0;
        }
    }

    window.removeRoom = function(index) {
        estimateData.rooms.splice(index, 1);
        updateRoomsList();
    };

    function clearRoomForm() {
        document.getElementById('roomLength').value = '';
        document.getElementById('roomWidth').value = '';
        document.getElementById('roomName').value = '';
    }

    function updateWoodTypeSelection() {
        const selected = document.querySelector('input[name="woodType"]:checked');
        if (selected) {
            estimateData.woodType = selected.value;
            enableNextButton('#step2');
        }
    }

    function updateInstallationTypeSelection() {
        const selected = document.querySelector('input[name="installationType"]:checked');
        if (selected) {
            estimateData.installationType = selected.value;
            enableNextButton('#step3');
        }
    }

    function updateAdditionalServices() {
        const selected = document.querySelectorAll('input[name="additionalServices"]:checked');
        estimateData.additionalServices = Array.from(selected).map(cb => cb.value);
    }

    function enableNextButton(stepSelector) {
        const nextBtn = document.querySelector(`${stepSelector} .next-step`);
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    function nextStep() {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            updateProgressBar();
            
            if (currentStep === totalSteps) {
                calculateAndShowEstimate();
            }
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
            updateProgressBar();
        }
    }

    function showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.estimator-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepEl = document.getElementById(`step${stepNumber}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }
    }

    function updateProgressBar() {
        const progress = (currentStep / totalSteps) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNum < currentStep) {
                indicator.classList.add('completed');
            } else if (stepNum === currentStep) {
                indicator.classList.add('active');
            }
        });
    }

    function calculateAndShowEstimate() {
        const totalArea = estimateData.rooms.reduce((sum, room) => sum + room.area, 0);
        
        // Calculate base costs
        const woodCost = totalArea * (woodTypeCosts[estimateData.woodType] || 8.50);
        const installationCost = totalArea * (installationCosts[estimateData.installationType] || 4.50);
        
        // Calculate additional services
        let additionalCost = 0;
        estimateData.additionalServices.forEach(service => {
            if (service === 'stairs' || service === 'transitions') {
                additionalCost += additionalServiceCosts[service] || 0;
            } else {
                additionalCost += totalArea * (additionalServiceCosts[service] || 0);
            }
        });

        const subtotal = woodCost + installationCost + additionalCost;
        const tax = subtotal * 0.0625; // 6.25% MA sales tax
        const total = subtotal + tax;

        // Display results
        updateEstimateDisplay({
            totalArea: totalArea,
            woodCost: woodCost,
            installationCost: installationCost,
            additionalCost: additionalCost,
            subtotal: subtotal,
            tax: tax,
            total: total
        });
    }

    function updateEstimateDisplay(costs) {
        const elements = {
            'estimate-area': costs.totalArea.toFixed(1),
            'estimate-wood-cost': `$${costs.woodCost.toFixed(2)}`,
            'estimate-installation-cost': `$${costs.installationCost.toFixed(2)}`,
            'estimate-additional-cost': `$${costs.additionalCost.toFixed(2)}`,
            'estimate-subtotal': `$${costs.subtotal.toFixed(2)}`,
            'estimate-tax': `$${costs.tax.toFixed(2)}`,
            'estimate-total': `$${costs.total.toFixed(2)}`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Show/hide additional costs row
        const additionalRow = document.getElementById('additional-cost-row');
        if (additionalRow) {
            additionalRow.style.display = costs.additionalCost > 0 ? 'table-row' : 'none';
        }
    }

    function submitEstimate() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const formData = new FormData(form);
        estimateData.customerInfo = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message')
        };

        // Here you would typically send the data to your server
        // For now, we'll just show a success modal
        showModal('estimateModal');
        
        // You can add analytics tracking here
        if (typeof gtag !== 'undefined') {
            gtag('event', 'estimate_completed', {
                'event_category': 'engagement',
                'event_label': 'hardwood_estimator'
            });
        }
    }

    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };

    // Format currency inputs
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Restart estimator
    window.restartEstimator = function() {
        currentStep = 1;
        estimateData = {
            rooms: [],
            woodType: '',
            installationType: '',
            additionalServices: [],
            customerInfo: {}
        };
        
        showStep(1);
        updateProgressBar();
        updateRoomsList();
        
        // Clear all form inputs
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        clearRoomForm();
        closeModal();
    };

    // Global functions for the estimator interface
    window.nextStep = function(stepNumber) {
        if (stepNumber === 2) {
            // Validate step 1 - ensure we have room dimensions OR direct area
            const length = parseFloat(document.getElementById('room-length').value);
            const width = parseFloat(document.getElementById('room-width').value);
            const directArea = parseFloat(document.getElementById('direct-area').value);
            const totalArea = parseFloat(document.getElementById('square-footage').value);
            
            const hasLengthWidth = length > 0 && width > 0;
            const hasDirectArea = directArea > 0;
            const hasTotalArea = totalArea > 0;
            
            if (!hasLengthWidth && !hasDirectArea && !hasTotalArea) {
                alert('Please enter room dimensions or total area before proceeding.');
                return;
            }
        }
        
        showStep(stepNumber);
        updateProgressBar(stepNumber);
        currentStep = stepNumber;
    };

    window.prevStep = function(stepNumber) {
        showStep(stepNumber);
        updateProgressBar(stepNumber);
        currentStep = stepNumber;
    };

    window.calculateEstimate = function() {
        // Get total area from either length/width calculation or direct input
        let totalArea = 0;
        const squareFootage = document.getElementById('square-footage');
        
        if (squareFootage && squareFootage.value) {
            totalArea = parseFloat(squareFootage.value);
        } else {
            const length = parseFloat(document.getElementById('room-length').value) || 0;
            const width = parseFloat(document.getElementById('room-width').value) || 0;
            const directArea = parseFloat(document.getElementById('direct-area').value) || 0;
            
            if (length > 0 && width > 0) {
                totalArea = length * width;
            } else if (directArea > 0) {
                totalArea = directArea;
            }
        }
        
        if (totalArea <= 0) {
            alert('Please enter valid room dimensions or total area.');
            return;
        }
        
        // Convert to square feet for calculation if using metric
        let areaInSqFt = totalArea;
        if (currentUnit === 'metric') {
            areaInSqFt = totalArea * SQM_TO_SQFT;
        }
        
        // Get wood type
        const woodType = document.querySelector('input[name="wood-type"]:checked');
        if (!woodType) {
            alert('Please select a wood type.');
            return;
        }
        
        const woodPrice = parseFloat(woodType.closest('.wood-option').dataset.price) || 6;
        
        // Get installation type
        const installationType = document.getElementById('installation-type');
        const installationMultiplier = parseFloat(installationType.selectedOptions[0].dataset.multiplier) || 1;
        
        // Base costs (calculated in sq ft for pricing consistency)
        const materialsCost = areaInSqFt * woodPrice;
        const laborBaseCost = areaInSqFt * 4; // Base labor cost per sq ft
        const laborCost = laborBaseCost * installationMultiplier;
        
        // Additional services
        let additionalCost = 0;
        
        const subfloorPrep = document.getElementById('subfloor-prep');
        if (subfloorPrep && subfloorPrep.checked) {
            additionalCost += areaInSqFt * 2;
        }
        
        const oldFloorRemoval = document.getElementById('old-floor-removal');
        if (oldFloorRemoval && oldFloorRemoval.checked) {
            additionalCost += areaInSqFt * 1.5;
        }
        
        const trimWork = document.getElementById('trim-work');
        if (trimWork && trimWork.checked) {
            let trimLength = parseFloat(document.getElementById('trim-length').value);
            if (!trimLength) {
                // Estimate trim length based on room perimeter
                if (currentUnit === 'metric') {
                    trimLength = (2 * (length + width)) * METERS_TO_FEET; // Convert to feet
                } else {
                    trimLength = 2 * (length + width);
                }
            } else if (currentUnit === 'metric') {
                trimLength = trimLength * METERS_TO_FEET; // Convert to feet for pricing
            }
            additionalCost += trimLength * 3;
        }
        
        const stairs = document.getElementById('stairs');
        if (stairs && stairs.checked) {
            const stairCount = parseFloat(document.getElementById('stairs-count').value) || 1;
            additionalCost += stairCount * 150;
        }
        
        const subtotal = materialsCost + laborCost + additionalCost;
        const total = subtotal;
        
        // Display results
        document.getElementById('materials-cost').textContent = `$${materialsCost.toFixed(2)}`;
        document.getElementById('labor-cost').textContent = `$${laborCost.toFixed(2)}`;
        document.getElementById('additional-cost').textContent = `$${additionalCost.toFixed(2)}`;
        document.getElementById('total-cost').textContent = `$${total.toFixed(2)}`;
        
        // Show/hide additional costs line
        const additionalLine = document.getElementById('additional-services-line');
        if (additionalLine) {
            additionalLine.style.display = additionalCost > 0 ? 'block' : 'none';
        }
        
        // Cost range (±15%)
        const rangeLow = total * 0.85;
        const rangeHigh = total * 1.15;
        document.getElementById('cost-range').textContent = `$${rangeLow.toFixed(2)} - $${rangeHigh.toFixed(2)}`;
        
        // Move to results step
        showStep(4);
        updateProgressBar(4);
        currentStep = 4;
    };

    window.requestQuote = function() {
        // Show quote modal
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
    };

    window.resetEstimator = function() {
        // Reset all form fields
        document.getElementById('room-length').value = '';
        document.getElementById('room-width').value = '';
        document.getElementById('square-footage').value = '';
        
        // Uncheck all radio buttons and checkboxes
        document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        
        // Reset select dropdown
        document.getElementById('installation-type').selectedIndex = 0;
        
        // Go back to step 1
        showStep(1);
        updateProgressBar(1);
        currentStep = 1;
    };

    window.submitQuoteRequest = function() {
        // Get form data
        const form = document.getElementById('quote-form');
        if (!form) return;
        
        // Basic validation
        const name = document.getElementById('quote-name').value;
        const phone = document.getElementById('quote-phone').value;
        const email = document.getElementById('quote-email').value;
        const address = document.getElementById('quote-address').value;
        
        if (!name || !phone || !email || !address) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Here you would send the data to your server
        alert('Thank you! We will contact you within 24 hours to schedule your free consultation.');
        
        // Close modal
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
        
        // Track conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quote_request', {
                'event_category': 'engagement',
                'event_label': 'hardwood_estimator'
            });
        }
    };

    function showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.estimator-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show current step
        const currentStepEl = document.getElementById(`step${stepNumber}`);
        if (currentStepEl) {
            currentStepEl.style.display = 'block';
        }
    }

    function updateProgressBar(stepNumber) {
        const totalSteps = 4;
        const progress = (stepNumber / totalSteps) * 100;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active');
            
            if (stepNum === stepNumber) {
                indicator.classList.add('active');
            }
        });
    }

    // Show/hide conditional fields
    document.addEventListener('change', function(e) {
        if (e.target.id === 'stairs') {
            const stairsGroup = document.getElementById('stairs-count-group');
            if (stairsGroup) {
                stairsGroup.style.display = e.target.checked ? 'block' : 'none';
            }
        }
        
        if (e.target.id === 'trim-work') {
            const trimGroup = document.getElementById('trim-length-group');
            if (trimGroup) {
                trimGroup.style.display = e.target.checked ? 'block' : 'none';
            }
        }
    });

    // Unit conversion functionality
    window.toggleUnit = function(unit) {
        const previousUnit = currentUnit;
        currentUnit = unit;
        
        // Update button states
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-unit="${unit}"]`).classList.add('active');
        
        // Update labels and placeholders
        updateUnitLabels();
        
        // Convert existing values if any
        convertExistingValues(previousUnit, unit);
        
        // Update pricing displays
        updatePricingDisplay();
        
        // Recalculate if needed
        calculateSquareFootage();
    };
    
    function updateUnitLabels() {
        const lengthUnit = document.getElementById('length-unit');
        const widthUnit = document.getElementById('width-unit');
        const areaUnit = document.getElementById('area-unit');
        const areaUnitDirect = document.getElementById('area-unit-direct');
        const trimUnit = document.getElementById('trim-unit');
        
        if (currentUnit === 'metric') {
            if (lengthUnit) lengthUnit.textContent = 'meters';
            if (widthUnit) widthUnit.textContent = 'meters';
            if (areaUnit) areaUnit.textContent = 'sq m';
            if (areaUnitDirect) areaUnitDirect.textContent = 'sq m';
            if (trimUnit) trimUnit.textContent = 'linear meters';
        } else {
            if (lengthUnit) lengthUnit.textContent = 'feet';
            if (widthUnit) widthUnit.textContent = 'feet';
            if (areaUnit) areaUnit.textContent = 'sq ft';
            if (areaUnitDirect) areaUnitDirect.textContent = 'sq ft';
            if (trimUnit) trimUnit.textContent = 'linear feet';
        }
    }
    
    function convertExistingValues(fromUnit, toUnit) {
        const lengthInput = document.getElementById('room-length');
        const widthInput = document.getElementById('room-width');
        const trimInput = document.getElementById('trim-length');
        const directAreaInput = document.getElementById('direct-area');
        
        if (fromUnit === toUnit) return; // No conversion needed
        
        // Convert length
        if (lengthInput && lengthInput.value) {
            const currentValue = parseFloat(lengthInput.value);
            if (currentValue > 0) {
                if (fromUnit === 'imperial' && toUnit === 'metric') {
                    lengthInput.value = (currentValue / METERS_TO_FEET).toFixed(2);
                } else if (fromUnit === 'metric' && toUnit === 'imperial') {
                    lengthInput.value = (currentValue * METERS_TO_FEET).toFixed(1);
                }
            }
        }
        
        // Convert width
        if (widthInput && widthInput.value) {
            const currentValue = parseFloat(widthInput.value);
            if (currentValue > 0) {
                if (fromUnit === 'imperial' && toUnit === 'metric') {
                    widthInput.value = (currentValue / METERS_TO_FEET).toFixed(2);
                } else if (fromUnit === 'metric' && toUnit === 'imperial') {
                    widthInput.value = (currentValue * METERS_TO_FEET).toFixed(1);
                }
            }
        }
        
        // Convert direct area
        if (directAreaInput && directAreaInput.value) {
            const currentValue = parseFloat(directAreaInput.value);
            if (currentValue > 0) {
                if (fromUnit === 'imperial' && toUnit === 'metric') {
                    directAreaInput.value = (currentValue / SQM_TO_SQFT).toFixed(2);
                } else if (fromUnit === 'metric' && toUnit === 'imperial') {
                    directAreaInput.value = (currentValue * SQM_TO_SQFT).toFixed(1);
                }
            }
        }
        
        // Convert trim length
        if (trimInput && trimInput.value) {
            const currentValue = parseFloat(trimInput.value);
            if (currentValue > 0) {
                if (fromUnit === 'imperial' && toUnit === 'metric') {
                    trimInput.value = (currentValue / METERS_TO_FEET).toFixed(2);
                } else if (fromUnit === 'metric' && toUnit === 'imperial') {
                    trimInput.value = (currentValue * METERS_TO_FEET).toFixed(1);
                }
            }
        }
    }
    
    function updatePricingDisplay() {
        const imperialPrices = document.querySelectorAll('.imperial-price');
        const metricPrices = document.querySelectorAll('.metric-price');
        
        if (currentUnit === 'metric') {
            imperialPrices.forEach(el => el.style.display = 'none');
            metricPrices.forEach(el => el.style.display = 'inline');
        } else {
            imperialPrices.forEach(el => el.style.display = 'inline');
            metricPrices.forEach(el => el.style.display = 'none');
        }
    }
});
