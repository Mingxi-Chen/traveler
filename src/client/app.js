
// MCP多步骤自动化流程模拟器
class TravelPlannerDemo {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 8;
        this.planData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupInterestTags();
    }

    setupEventListeners() {
        document.getElementById('travelForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startPlanning();
        });
    }

    setupInterestTags() {
        document.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
            });
        });
    }

    async startPlanning() {
        // 收集表单数据
        this.planData = {
            origin: document.getElementById('origin').value,
            destination: document.getElementById('destination').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            budget: document.getElementById('budget').value,
            travelStyle: document.getElementById('travelStyle').value,
            interests: Array.from(document.querySelectorAll('.interest-tag.selected'))
                .map(tag => tag.dataset.interest)
        };

        // 显示加载界面
        this.showLoading(true);
        this.resetSteps();

        // 执行多步骤规划流程
        await this.executePlanningSteps();
    }

    async executePlanningSteps() {
        const steps = [
            { name: '获取天气信息', handler: () => this.fetchWeather() },
            { name: '搜索航班信息', handler: () => this.searchFlights() },
            { name: '查找酒店选项', handler: () => this.searchHotels() },
            { name: '推荐旅游景点', handler: () => this.searchAttractions() },
            { name: '推荐当地餐厅', handler: () => this.searchRestaurants() },
            { name: '生成详细行程', handler: () => this.generateItinerary() },
            { name: '准备常用语翻译', handler: () => this.prepareTranslations() },
            { name: '计算预算明细', handler: () => this.calculateBudget() }
        ];

        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '';

        for (let i = 0; i < steps.length; i++) {
            this.currentStep = i + 1;
            this.updateProgress();
            this.updateStepIndicator();
            this.updateStatus(steps[i].name);

            // 模拟API调用延迟
            await this.delay(1000 + Math.random() * 1000);

            // 执行步骤
            const result = await steps[i].handler();
            
            // 显示结果
            this.displayStepResult(steps[i].name, result);
        }

        this.showLoading(false);
        this.showCompletionMessage();
    }

    async fetchWeather() {
        return {
            temperature: 22,
            feels_like: 20,
            humidity: 65,
            description: '多云',
            wind_speed: 3.5,
            recommendation: '天气适宜出行，建议携带薄外套'
        };
    }

    async searchFlights() {
        return [
            { airline: '东方航空', flight: 'MU5678', departure: '08:00', arrival: '10:30', price: 980 },
            { airline: '中国国航', flight: 'CA1234', departure: '14:00', arrival: '16:30', price: 1250 },
            { airline: '南方航空', flight: 'CZ9012', departure: '19:00', arrival: '21:30', price: 1100 }
        ];
    }

    async searchHotels() {
        return [
            { name: '和平饭店', rating: 4.8, price: '￥680/晚', location: '外滩' },
            { name: '浦东香格里拉', rating: 4.7, price: '￥980/晚', location: '陆家嘴' },
            { name: '锦江之星', rating: 4.2, price: '￥280/晚', location: '人民广场' }
        ];
    }

    async searchAttractions() {
        return [
            { name: '外滩', rating: 4.9, type: '历史景点', duration: '2-3小时' },
            { name: '东方明珠', rating: 4.6, type: '观光塔', duration: '2小时' },
            { name: '豫园', rating: 4.5, type: '古典园林', duration: '3小时' },
            { name: '迪士尼乐园', rating: 4.8, type: '主题公园', duration: '全天' }
        ];
    }

    async searchRestaurants() {
        return [
            { name: '老饭店', cuisine: '本帮菜', rating: 4.6, price: '￥150/人' },
            { name: '南翔馒头店', cuisine: '小笼包', rating: 4.5, price: '￥80/人' },
            { name: '外滩三号', cuisine: '西餐', rating: 4.7, price: '￥300/人' }
        ];
    }

    async generateItinerary() {
        const days = this.calculateDays();
        const itinerary = [];
        
        for (let i = 0; i < days; i++) {
            itinerary.push({
                day: i + 1,
                activities: [
                    { time: '09:00', activity: '酒店早餐' },
                    { time: '10:00', activity: '参观景点' },
                    { time: '12:30', activity: '午餐' },
                    { time: '14:00', activity: '继续游览' },
                    { time: '18:00', activity: '晚餐' },
                    { time: '20:00', activity: '自由活动' }
                ]
            });
        }
        
        return itinerary;
    }

    async prepareTranslations() {
        return {
            '你好': 'Hello / 你好',
            '谢谢': 'Thank you / 谢谢',
            '多少钱': 'How much / 多少钱',
            '洗手间在哪里': 'Where is the restroom / 洗手间在哪里',
            '请帮助我': 'Please help me / 请帮助我'
        };
    }

    async calculateBudget() {
        const days = this.calculateDays();
        return {
            flights: 2000,
            accommodation: days * 680,
            meals: days * 300,
            attractions: days * 200,
            transportation: days * 100,
            shopping: 1000,
            emergency: 500,
            total: 2000 + (days * 1280) + 1500
        };
    }

    calculateDays() {
        const start = new Date(this.planData.startDate);
        const end = new Date(this.planData.endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    displayStepResult(stepName, result) {
        const resultsContainer = document.getElementById('resultsContainer');
        let html = '';

        switch(stepName) {
            case '获取天气信息':
                html = `
                    <div class="weather-widget">
                        <h3>${this.planData.destination}天气</h3>
                        <div class="weather-temp">${result.temperature}°C</div>
                        <div class="weather-desc">${result.description}</div>
                        <p>体感温度: ${result.feels_like}°C | 湿度: ${result.humidity}% | 风速: ${result.wind_speed}m/s</p>
                        <p style="margin-top: 10px; opacity: 0.9;">${result.recommendation}</p>
                    </div>
                `;
                break;

            case '搜索航班信息':
                html = '<div class="result-card"><h3>✈️ 推荐航班</h3>';
                result.forEach(flight => {
                    html += `
                        <div class="activity">
                            <div class="activity-time">${flight.departure}</div>
                            <div class="activity-details">
                                <h4>${flight.airline} ${flight.flight}</h4>
                                <p>到达: ${flight.arrival} | 价格: ￥${flight.price}</p>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                break;

            case '查找酒店选项':
                html = '<div class="result-card"><h3>🏨 推荐酒店</h3>';
                result.forEach(hotel => {
                    html += `
                        <div class="activity">
                            <div class="activity-time">⭐${hotel.rating}</div>
                            <div class="activity-details">
                                <h4>${hotel.name}</h4>
                                <p>${hotel.location} | ${hotel.price}</p>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                break;

            case '生成详细行程':
                html = '<div class="result-card"><h3>📅 行程安排</h3>';
                result.forEach(day => {
                    html += `
                        <div class="itinerary-day">
                            <div class="day-header">
                                <div class="day-number">D${day.day}</div>
                                <div>
                                    <h4>第${day.day}天行程</h4>
                                </div>
                            </div>
                            <div>
                    `;
                    day.activities.forEach(activity => {
                        html += `
                            <div class="activity">
                                <div class="activity-time">${activity.time}</div>
                                <div class="activity-details">
                                    <p>${activity.activity}</p>
                                </div>
                            </div>
                        `;
                    });
                    html += '</div></div>';
                });
                html += '</div>';
                break;

            case '计算预算明细':
                html = `
                    <div class="budget-breakdown">
                        <h3>💰 预算明细</h3>
                        <div class="budget-item">
                            <span class="budget-label">往返机票</span>
                            <span class="budget-amount">￥${result.flights}</span>
                        </div>
                        <div class="budget-item">
                            <span class="budget-label">住宿费用</span>
                            <span class="budget-amount">￥${result.accommodation}</span>
                        </div>
                        <div class="budget-item">
                            <span class="budget-label">餐饮费用</span>
                            <span class="budget-amount">￥${result.meals}</span>
                        </div>
                        <div class="budget-item">
                            <span class="budget-label">景点门票</span>
                            <span class="budget-amount">￥${result.attractions}</span>
                        </div>
                        <div class="budget-item">
                            <span class="budget-label">交通费用</span>
                            <span class="budget-amount">￥${result.transportation}</span>
                        </div>
                        <div class="budget-item">
                            <span class="budget-label">购物预算</span>
                            <span class="budget-amount">￥${result.shopping}</span>
                        </div>
                        <div class="budget-item">
                            <span class="budget-label">应急备用</span>
                            <span class="budget-amount">￥${result.emergency}</span>
                        </div>
                        <div class="budget-item">
                            <span class="budget-label">总计</span>
                            <span class="budget-amount">￥${result.total}</span>
                        </div>
                    </div>
                `;
                break;

            default:
                html = `
                    <div class="result-card">
                        <div class="result-header">
                            <div class="result-title">${stepName}</div>
                            <div class="result-badge">完成</div>
                        </div>
                        <div class="result-content">
                            ${JSON.stringify(result, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}
                        </div>
                    </div>
                `;
        }

        resultsContainer.innerHTML += html;
    }

    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }

    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < this.currentStep - 1) {
                step.classList.add('completed');
            } else if (index === this.currentStep - 1) {
                step.classList.add('active');
            }
        });
    }

    updateStatus(message) {
        document.getElementById('statusMessage').textContent = `正在执行: ${message}...`;
    }

    resetSteps() {
        this.currentStep = 0;
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        document.getElementById('progressBar').style.width = '0%';
    }

    showLoading(show) {
        document.getElementById('loadingOverlay').classList.toggle('active', show);
    }

    showCompletionMessage() {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML += `
            <div class="result-card" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">
                <div class="result-header">
                    <div class="result-title" style="color: white;">✅ 规划完成！</div>
                </div>
                <div class="result-content" style="color: white;">
                    您的${this.planData.destination}之旅已经规划完成！系统已经为您：
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>查询了实时天气信息</li>
                        <li>搜索了最优航班选择</li>
                        <li>推荐了合适的酒店</li>
                        <li>精选了必游景点</li>
                        <li>推荐了地道美食</li>
                        <li>生成了详细行程</li>
                        <li>准备了常用语翻译</li>
                        <li>计算了预算明细</li>
                    </ul>
                    <p style="margin-top: 15px;">祝您旅途愉快！ 🎉</p>
                </div>
            </div>
        `;

        // 滚动到底部
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TravelPlannerDemo();
});

// 添加一些交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 为输入框添加动画效果
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    // 设置默认日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    document.getElementById('startDate').valueAsDate = tomorrow;
    document.getElementById('endDate').valueAsDate = nextWeek;
});
