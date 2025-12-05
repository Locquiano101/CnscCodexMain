import {
  Receipt,
  FinancialReport,
  Accreditation,
  collectibleFee,
  cashInflows,
} from "../models/index.js";
import { logAction } from "../middleware/audit.js";

export const addCashInflow = async (req, res) => {
  try {
    const {
      organizationProfile,
      collectibleFee,
      paidRosterMembers,
      amount, // amount per head
      date,
      financialReportId,
    } = req.body;

    if (
      !organizationProfile ||
      !collectibleFee ||
      !amount ||
      !paidRosterMembers
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 1️⃣ Calculate total amount (amount per head * paidRosterMembers)
    const totalAmount = parseFloat(amount) * parseInt(paidRosterMembers, 10);

    // 2️⃣ Create CashInflow document
    const newCashInflow = new cashInflows({
      organizationProfile,
      collectibleFee,
      paidRosterMembers,
      amount: totalAmount,
      date,
      status: "UNCHECKED",
    });

    await newCashInflow.save();

    const updatedReport = await FinancialReport.findByIdAndUpdate(
      financialReportId,
      {
        $inc: { initialBalance: totalAmount },
        $push: { cashInflows: newCashInflow._id },
      },
      { new: true } // returns the updated document
    );

    if (!updatedReport) {
      throw new Error("Financial report not found");
    }

    if (!updatedReport) {
      return res.status(404).json({ error: "Financial report not found." });
    }

    // 4️⃣ Audit log
    logAction(req, {
      action: "cashinflow.add",
      targetType: "CashInflow",
      targetId: newCashInflow._id,
      organizationProfile,
      meta: { collectibleFee, paidRosterMembers, totalAmount },
    });

    return res.status(201).json({
      message: "Cash inflow added successfully.",
      cashInflow: newCashInflow,
      financialReport: updatedReport,
    });
  } catch (err) {
    console.error("❌ Error adding cash inflow:", err);
    return res.status(500).json({ error: "Failed to add cash inflow." });
  }
};

export const createCollectibleFee = async (req, res) => {
  try {
    const {
      organizationProfile,
      amount, // amount per member
      paidRosterMembers, // number of members who paid
      title,
      description,
      date,
      financialReportId,
    } = req.body;

    // 1️⃣ First, get the current financial report to access the initialBalance
    const financialReport = await FinancialReport.findById(financialReportId);

    if (!financialReport) {
      return res.status(404).json({ error: "Financial report not found." });
    }

    // 2️⃣ Calculate total amount (amount per head * paidRosterMembers)

    // 3️⃣ Calculate new initial balance
    const currentBalance = parseFloat(financialReport.initialBalance) || 0;
    const newInitialBalance = currentBalance + amount;

    // 4️⃣ Create CollectibleFee document
    const newCollectibleFee = new collectibleFee({
      organizationProfile,
      amount,
      title,
      description,
      paidRosterMembers,
      date,
      status: "UNCHECKED",
      isCollected: false,
    });

    await newCollectibleFee.save();

    // 5️⃣ Update Financial Report with new calculated balance
    const updatedReport = await FinancialReport.findByIdAndUpdate(
      financialReportId,
      {
        $set: { initialBalance: newInitialBalance }, // Set the new calculated balance
        $push: { collectibleFees: newCollectibleFee._id },
      },
      { new: true } // returns the updated document
    );

    // 6️⃣ Audit log
    logAction(req, {
      action: "collectiblefee.add",
      targetType: "CollectibleFee",
      targetId: newCollectibleFee._id,
      organizationProfile,
      meta: {
        title,
        description,
        amountPerHead: amount,
        paidRosterMembers,
        amount,
        previousBalance: currentBalance,
        newBalance: newInitialBalance,
      },
    });

    return res.status(201).json({
      message: "Collectible fee added successfully.",
      collectibleFee: newCollectibleFee,
      financialReport: updatedReport,
      balanceUpdate: {
        previous: currentBalance,
        added: amount,
        new: newInitialBalance,
      },
    });
  } catch (err) {
    console.error("❌ Error creating collectible fee:", err);
    return res.status(500).json({ error: "Failed to create collectible fee." });
  }
};

export const getCollectibleFees = async (req, res) => {
  try {
    const fees = await CollectibleFee.find().populate("organizationProfile");
    res.status(200).json(fees);
  } catch (err) {
    console.error("Error fetching collectible fees:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCollectibleFeesByOrg = async (req, res) => {
  const { orgId } = req.params;
  try {
    const fees = await collectibleFee.find({ organizationProfile: orgId });
    res.status(200).json(fees);
  } catch (err) {
    console.error("Error fetching fees for organization:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFinancialReportAll = async (req, res) => {
  try {
    const reports = await FinancialReport.find()
      // populate organization profile
      .populate("organizationProfile")
      // populate reimbursements and their documents
      .populate({
        path: "reimbursements",
        populate: { path: "document" },
      })
      // populate disbursements and their documents
      .populate({
        path: "disbursements",
        populate: { path: "document" },
      })
      // populate collections and their documents
      .populate({
        path: "collections",
        populate: { path: "document" },
      })
      // populate collectibleFees
      .populate("collectibleFees")
      // populate cash inflows
      .populate("cashInflows")
      // populate cash outflows
      .populate("cashoutflows");

    return res.status(200).json(reports);
  } catch (error) {
    console.error("❌ Error fetching financial reports:", error);
    return res.status(500).json({
      error: "Failed to retrieve financial reports.",
    });
  }
};

export const getFinancialReportByOrg = async (req, res) => {
  try {
    const { OrgProfileId } = req.params;

    if (!OrgProfileId) {
      return res.status(400).json({ error: "Missing organizationProfile." });
    }

    // 1️⃣ Ensure Financial Report exists
    let report = await FinancialReport.findOne({
      organizationProfile: OrgProfileId,
    })
      // populate organization profile
      .populate("organizationProfile")
      // populate reimbursements and their documents
      .populate({
        path: "reimbursements",
        populate: { path: "document" },
      })
      // populate disbursements and their documents
      .populate({
        path: "disbursements",
        populate: { path: "document" },
      })
      // populate collections and their documents
      .populate({
        path: "collections",
        populate: { path: "document" },
      })
      // populate collectibleFees
      .populate("collectibleFees")
      // populate cash inflows
      .populate({
        path: "cashInflows",
        populate: { path: "collectibleFee" }, // ✅ nested populate
      })
      // populate cash outflows
      .populate("cashoutflows");

    if (!report) {
      report = new FinancialReport({
        organizationProfile: OrgProfileId,
        reimbursements: [],
        disbursements: [],
        initialBalance: 0,
        endingBalance: 0,
        isActive: true,
      });

      await report.save();

      // Repopulate after saving
      report = await FinancialReport.findById(report._id)
        .populate({
          path: "reimbursements",
          populate: { path: "document" },
        })
        .populate({
          path: "disbursements",
          populate: { path: "document" },
        });
    }

    // 2️⃣ Ensure Accreditation has the FinancialReport linked
    let accreditation = await Accreditation.findOne({
      organizationProfile: OrgProfileId,
    });

    if (accreditation && !accreditation.FinancialReport) {
      accreditation.FinancialReport = report._id;
      await accreditation.save();
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("❌ Error fetching/creating financial report:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve or create financial report." });
  }
};

export const AddReceipt = async (req, res) => {
  try {
    const {
      description,
      amount,
      name,
      expenseType,
      date,
      organizationProfile,
      type, // "reimbursement", "disbursement", or "collection"
      financialReportId, // may or may not exist
    } = req.body;

    const documentId = res.locals.documentId;

    // Create and save the receipt
    const newReceipt = new Receipt({
      description,
      amount,
      name,
      expenseType,
      date,
      organizationProfile,
      document: documentId,
      type,
    });

    await newReceipt.save();
    console.log(type);
    // Determine which field to update and balance adjustment
    let updateField;
    let balanceAdjustment = 0;

    switch (type) {
      case "reimbursement":
        updateField = "reimbursements";
        balanceAdjustment = -amount; // reimbursement increases balance
        break;
      case "disbursement":
        updateField = "disbursements";
        balanceAdjustment = -amount; // disbursement decreases balance
        break;
      case "collection":
        updateField = "collections";
        balanceAdjustment = amount; // collection increases balance
        break;
      default:
        return res.status(400).json({ error: "Invalid transaction type." });
    }

    let updatedFinancialReport;

    if (financialReportId) {
      // Update existing financial report
      updatedFinancialReport = await FinancialReport.findByIdAndUpdate(
        financialReportId,
        {
          $push: { [updateField]: newReceipt._id },
          $inc: { initialBalance: balanceAdjustment },
        },
        { new: true }
      );

      if (!updatedFinancialReport) {
        return res.status(404).json({ error: "Financial report not found." });
      }
    } else {
      // Create new financial report instance
      const newReportData = {
        organizationProfile,
        expenseType,
        initialBalance: balanceAdjustment, // Set initial balance based on first transaction
        endingBalance: 0,
        [updateField]: [newReceipt._id],
      };

      updatedFinancialReport = new FinancialReport(newReportData);
      await updatedFinancialReport.save();
    }

    // 📝 Audit log: financial receipt added
    logAction(req, {
      action: "financial-report.add",
      targetType: "FinancialReport",
      targetId: updatedFinancialReport?._id || null,
      organizationProfile:
        organizationProfile ||
        updatedFinancialReport?.organizationProfile ||
        null,
      organizationName: null,
      meta: { type, amount, description, name },
    });

    return res.status(201).json({
      message: "Receipt successfully created and linked to financial report.",
      receipt: newReceipt,
      financialReport: updatedFinancialReport,
    });
  } catch (error) {
    console.error("❌ Error creating receipt and financial report:", error);
    return res.status(500).json({ error: "Failed to create receipt." });
  }
};
