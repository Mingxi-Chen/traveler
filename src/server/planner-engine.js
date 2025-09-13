
  

export class TravelPlannerEngine {
    constructor(apiService) {
      this.apiService = apiService;
      this.currentPlan = null;
    }
  
    // 创建完整的旅行计划
    async createTravelPlan(params) {
      const {
        destination,
        origin,
        startDate,
        endDate,
        budget,
        interests = [],
        travelStyle = 'balanced'
      } = params;
  
      console.log('开始创建旅行计划...');
      
      const plan = {
        id: `plan_${Date.now()}`,
        created_at: new Date().toISOString(),
        destination,
        origin,
        startDate,
        endDate,
        budget,
        interests,
        travelStyle,
        components: {}
      };
  
      // 步骤1：获取目的地天气
      console.log('步骤1：获取天气信息...');
      plan.components.weather = await this.apiService.getWeather(destination);
  
      // 步骤2：搜索航班
      console.log('步骤2：搜索航班信息...');
      plan.components.flights = await this.apiService.searchFlights(
        origin,
        destination,
        startDate
      );
  
      // 步骤3：搜索住宿
      console.log('步骤3：搜索住宿选项...');
      plan.components.hotels = await this.apiService.searchPlaces(destination, 'hotel');
  
      // 步骤4：搜索景点
      console.log('步骤4：搜索旅游景点...');
      plan.components.attractions = await this.apiService.searchPlaces(
        destination,
        'tourist_attraction'
      );
  
      // 步骤5：搜索餐厅
      console.log('步骤5：搜索餐厅推荐...');
      plan.components.restaurants = await this.apiService.searchPlaces(
        destination,
        'restaurant'
      );
  
      // 步骤6：生成日程安排
      console.log('步骤6：生成详细日程...');
      plan.components.itinerary = this.generateItinerary(plan);
  
      // 步骤7：准备常用语翻译
      console.log('步骤7：准备常用语翻译...');
      plan.components.translations = await this.prepareTranslations();
  
      // 步骤8：计算预算估算
      console.log('步骤8：计算预算估算...');
      plan.components.budgetEstimate = this.calculateBudget(plan);
  
      this.currentPlan = plan;
      console.log('旅行计划创建完成！');
      
      return plan;
    }
  
    // 生成详细日程
    generateItinerary(plan) {
      const days = this.calculateDays(plan.startDate, plan.endDate);
      const itinerary = [];
  
      for (let i = 0; i < days; i++) {
        const dayPlan = {
          day: i + 1,
          date: this.addDays(plan.startDate, i),
          activities: []
        };
  
        // 早上活动
        if (plan.components.attractions && plan.components.attractions[i]) {
          dayPlan.activities.push({
            time: '09:00',
            type: 'attraction',
            name: plan.components.attractions[i].name,
            duration: '3 hours'
          });
        }
  
        // 午餐
        if (plan.components.restaurants && plan.components.restaurants[0]) {
          dayPlan.activities.push({
            time: '12:00',
            type: 'meal',
            name: plan.components.restaurants[0].name,
            duration: '1.5 hours'
          });
        }
  
        // 下午活动
        if (plan.components.attractions && plan.components.attractions[i + 1]) {
          dayPlan.activities.push({
            time: '14:00',
            type: 'attraction',
            name: plan.components.attractions[i + 1]?.name || '自由活动',
            duration: '3 hours'
          });
        }
  
        // 晚餐
        if (plan.components.restaurants && plan.components.restaurants[1]) {
          dayPlan.activities.push({
            time: '18:00',
            type: 'meal',
            name: plan.components.restaurants[1].name,
            duration: '2 hours'
          });
        }
  
        itinerary.push(dayPlan);
      }
  
      return itinerary;
    }
  
    // 准备常用语翻译
    async prepareTranslations() {
      const commonPhrases = [
        '你好',
        '谢谢',
        '再见',
        '多少钱',
        '洗手间在哪里'
      ];
  
      const translations = {};
      for (const phrase of commonPhrases) {
        translations[phrase] = await this.apiService.translate(phrase);
      }
  
      return translations;
    }
  
    // 计算预算估算
    calculateBudget(plan) {
      const days = this.calculateDays(plan.startDate, plan.endDate);
      
      // 基础估算
      const estimate = {
        flights: 2000,
        accommodation: days * 500,
        meals: days * 200,
        attractions: days * 150,
        transportation: days * 100,
        shopping: 500,
        emergency: 500
      };
  
      // 根据预算级别调整
      const budgetMultiplier = {
        budget: 0.7,
        balanced: 1.0,
        luxury: 1.5
      };
  
      const multiplier = budgetMultiplier[plan.travelStyle] || 1.0;
      
      Object.keys(estimate).forEach(key => {
        estimate[key] = Math.round(estimate[key] * multiplier);
      });
  
      estimate.total = Object.values(estimate).reduce((sum, val) => sum + val, 0);
  
      return estimate;
    }
  
    // 辅助函数
    calculateDays(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
  
    addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result.toISOString().split('T')[0];
    }
  
    // 优化现有计划
    async optimizePlan(planId, preferences) {
      if (!this.currentPlan || this.currentPlan.id !== planId) {
        return { error: '找不到指定的旅行计划' };
      }
  
      // 根据用户偏好重新调整计划
      console.log('正在优化旅行计划...');
      
      // 重新排序景点（根据评分和用户兴趣）
      if (preferences.prioritizeHighRated) {
        this.currentPlan.components.attractions.sort((a, b) => b.rating - a.rating);
      }
  
      // 调整预算分配
      if (preferences.saveMoney) {
        this.currentPlan.components.budgetEstimate = this.calculateBudget({
          ...this.currentPlan,
          travelStyle: 'budget'
        });
      }
  
      // 重新生成日程
      this.currentPlan.components.itinerary = this.generateItinerary(this.currentPlan);
  
      return this.currentPlan;
    }
  }