import { Receipt, FinancialReport, Accreditation } from "../models/index.js";

export const getFinancialReportAll = async (req, res) => {
  try {
    // 1️⃣ Fetch all Financial Reports with nested population
    const reports = await FinancialReport.find()
      .populate({
        path: "reimbursements",
        populate: { path: "document" }, // populate document inside reimbursements
      })
      .populate({
        path: "disbursements",
        populate: { path: "document" }, // populate document inside disbursements
      })
      .populate({
        path: "collections",
        populate: { path: "document" }, // populate document inside collections
      })
      .populate("organizationProfile");

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
      .populate({
        path: "reimbursements",
        populate: { path: "document" }, // populate document inside reimbursements
      })
      .populate({
        path: "disbursements",
        populate: { path: "document" }, // populate document inside disbursements
      })
      .populate({
        path: "collections",
        populate: { path: "document" }, // populate document inside disbursements
      });

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
