document.addEventListener('DOMContentLoaded', () => {
    // Tag Selection Logic
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    // AI Planner Form Submission
    const form = document.getElementById('aiPlannerForm');
    const resultContainer = document.getElementById('resultContainer');
    const timelineContent = document.getElementById('timelineContent');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // UI Feedback: Loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Đang phân tích dữ liệu...';
        submitBtn.style.opacity = '0.8';
        submitBtn.disabled = true;

        // Simulate AI Processing Time
        setTimeout(() => {
            generateItinerary();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.style.opacity = '1';
            submitBtn.disabled = false;
            
            // Show result
            resultContainer.classList.remove('hidden');
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2000);
    });

    function generateItinerary() {
        const duration = document.getElementById('duration').value;
        const budget = document.getElementById('budget').value;
        
        // Mock data generation based on inputs
        let html = '';
        
        for(let i = 1; i <= parseInt(duration); i++) {
            let delay = (i - 1) * 0.2; // Staggered animation delay
            
            let places = '';
            if (i === 1) {
                places = `
                    <div class="suggested-places">
                        <div class="place-card">
                            <i class="fa-solid fa-landmark"></i> Đại Nội Huế (Tham quan)
                        </div>
                        <div class="place-card">
                            <i class="fa-solid fa-mug-hot"></i> Cà phê Mắt Biếc (Nghỉ ngơi)
                        </div>
                    </div>
                `;
            } else if (i === 2) {
                places = `
                    <div class="suggested-places">
                        <div class="place-card">
                            <i class="fa-solid fa-motorcycle"></i> Thuê xe đi Lăng Tự Đức (150k/ngày)
                        </div>
                        <div class="place-card">
                            <i class="fa-solid fa-bowl-food"></i> Bún Bò O Cương (Ẩm thực)
                        </div>
                    </div>
                `;
            } else {
                places = `
                    <div class="suggested-places">
                        <div class="place-card">
                            <i class="fa-solid fa-bridge-water"></i> Dạo Cầu Trường Tiền
                        </div>
                        <div class="place-card">
                            <i class="fa-solid fa-basket-shopping"></i> Chợ Đông Ba (Mua sắm)
                        </div>
                    </div>
                `;
            }

            html += `
                <div class="timeline-item" style="animation-delay: ${delay}s">
                    <h4>Ngày ${i}</h4>
                    <p>Lịch trình được tối ưu hóa theo thời tiết (Dự báo: Nắng đẹp, 28°C).</p>
                    ${places}
                </div>
            `;
        }

        // Add a Local Guide recommendation
        html += `
            <div class="timeline-item" style="animation-delay: ${parseInt(duration) * 0.2}s; border-color: var(--secondary-color);">
                <h4><i class="fa-solid fa-star" style="color: #fbbf24;"></i> Đề xuất Local Guide</h4>
                <p>Thuê Local Guide để nghe kể chuyện lịch sử và có người chụp ảnh cực đẹp.</p>
                <div class="suggested-places">
                    <div class="place-card" style="background: rgba(139, 92, 246, 0.1);">
                        <img src="https://i.pravatar.cc/150?img=32" alt="Guide" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                        <div>
                            <strong>Minh Tuấn</strong> (4.9 ⭐) - 300k/ngày
                        </div>
                    </div>
                </div>
            </div>
        `;

        timelineContent.innerHTML = html;
    }
});
