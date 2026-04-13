
import ProductModel from "../models/ProductModel.js";
import Sale from "../models/saleModel.js";


export const getDailyOrders = async (req, res) => {
  try {

    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    const orders = await Sale.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    res.status(200).json({
      success: true,
      dailyOrders: orders
    });

  } catch (error) {
    res.status(500).json({ success:false, message:error.message });
  }
};

export const getDailyProductsSold = async (req, res) => {
  try {

    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end }
    });

    let totalProductsSold = 0;

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        totalProductsSold += item.quantity;
      });
    });

    res.json({
      success: true,
      totalProductsSold
    });

  } catch (error) {
    res.status(500).json({ message:error.message });
  }
};


export const getLowStockProducts = async (req, res) => {
  try {

    const products = await ProductModel.find({
      $expr: { $lte: ["$stockQuantity", "$lowStockAlert"] }
    }).select("name stockQuantity lowStockAlert barcode");

    res.json({
      success: true,
      products
    });

  } catch (error) {
    res.status(500).json({ message:error.message });
  }
};

export const getSalesChart = async (req, res) => {
  try {

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const sales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSales: { $sum: "$finalAmount" },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      sales
    });

  } catch (error) {
    res.status(500).json({ message:error.message });
  }
};



export const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    const last6MonthsStart = new Date(monthStart);
    last6MonthsStart.setMonth(last6MonthsStart.getMonth() - 5);
    last6MonthsStart.setDate(1);

    const dailyOrders = await Sale.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const todaySales = await Sale.find({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const totalProducts = await ProductModel.countDocuments();
    const todayAddedProducts = await ProductModel.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });
    const thisMonthAddedProducts = await ProductModel.countDocuments({
      createdAt: { $gte: monthStart, $lte: todayEnd }
    });

    let totalProductsSold = 0;
    todaySales.forEach((sale) => {
      sale.items.forEach((item) => {
        totalProductsSold += item.quantity;
      });
    });

    const todayRevenue = todaySales.reduce(
      (total, sale) => total + sale.finalAmount,
      0
    );

    const totalRevenueResult = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalAmount" }
        }
      }
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    const totalProductsSoldResult = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalProductsSoldAll: { $sum: "$items.quantity" }
        }
      }
    ]);
    const totalProductsSoldAll = totalProductsSoldResult[0]?.totalProductsSoldAll || 0;

    const monthProductsSoldResult = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart, $lte: todayEnd }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          productsSoldThisMonth: { $sum: "$items.quantity" }
        }
      }
    ]);
    const productsSoldThisMonth = monthProductsSoldResult[0]?.productsSoldThisMonth || 0;

    const lowStockProducts = await ProductModel.find({
      $expr: { $lte: ["$stockQuantity", "$lowStockAlert"] }
    })
      .select("name stockQuantity barcode")
      .limit(5);

    const last7Days = new Date(todayStart);
    last7Days.setDate(last7Days.getDate() - 6);

    const salesChart = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          totalSales: { $sum: "$finalAmount" },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const addedProductsChart = await ProductModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last6MonthsStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt"
            }
          },
          totalAdded: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const productsSoldChart = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: last6MonthsStart, $lte: todayEnd }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt"
            }
          },
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("billNumber finalAmount createdAt");

    res.status(200).json({
      success: true,
      summary: {
        dailyOrders,
        totalProducts,
        totalProductsSold,
        totalProductsSoldAll,
        productsSoldThisMonth,
        todayAddedProducts,
        thisMonthAddedProducts,
        todayRevenue,
        totalRevenue,
        lowStockItems: lowStockProducts.length
      },
      lowStockProducts,
      recentSales,
      salesChart,
      addedProductsChart,
      productsSoldChart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};