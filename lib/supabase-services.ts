import type { Donation, Donor, Receipt, SMSEvent } from "@/types";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Users service
export const usersService = {
  async getAll() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    return data;
  },

  async updateRole(id: string, role: string) {
    const { data, error } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async create(user: {
    id: string;
    name: string;
    role?: string;
    email_verified?: boolean;
  }) {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          ...user,
          role: user.role || "user",
          email_verified: user.email_verified || false,
          permissions:
            user.role === "admin"
              ? ["dashboard:read", "admin:access"]
              : ["dashboard:read"],
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { data, error } = await supabase
      .from("users")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Donors service
export const donorsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    return data;
  },

  async create(donor: Omit<Donor, "id" | "createdAt" | "updatedAt">) {
    // Transform camelCase to snake_case for database
    const dbDonor = {
      name: donor.name,
      date_of_birth: donor.dateOfBirth
        ? new Date(donor.dateOfBirth).toISOString().split("T")[0]
        : null,
      phone: donor.phone || null,
      address: donor.address || null,
      email: donor.email || null,
      donation_type: donor.donationType,
      membership: donor.membership,
      notes: donor.notes || null,
      total_donations: donor.totalDonations || 0,
      last_donation_date: donor.lastDonationDate
        ? new Date(donor.lastDonationDate).toISOString().split("T")[0]
        : null,
      frequency: donor.frequency || null,
      frequency_amount: donor.frequencyAmount || 0,
    };

    const { data, error } = await supabase
      .from("donors")
      .insert([dbDonor])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Donor>) {
    // Transform camelCase to snake_case for database
    const dbUpdates: Record<string, string | number | null> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.dateOfBirth !== undefined) {
      dbUpdates.date_of_birth = updates.dateOfBirth
        ? new Date(updates.dateOfBirth).toISOString().split("T")[0]
        : null;
    }
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.donationType !== undefined)
      dbUpdates.donation_type = updates.donationType;
    if (updates.membership !== undefined)
      dbUpdates.membership = updates.membership;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.totalDonations !== undefined)
      dbUpdates.total_donations = updates.totalDonations;
    if (updates.lastDonationDate !== undefined) {
      dbUpdates.last_donation_date = updates.lastDonationDate
        ? new Date(updates.lastDonationDate).toISOString().split("T")[0]
        : null;
    }
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.frequencyAmount !== undefined)
      dbUpdates.frequency_amount = updates.frequencyAmount;

    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("donors")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { data, error } = await supabase
      .from("donors")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDonationStats(
    donorId: string,
    donationAmount: number,
    donationDate: Date
  ) {
    // Get current donor data
    const { data: currentDonor, error: fetchError } = await supabase
      .from("donors")
      .select("total_donations, last_donation_date")
      .eq("id", donorId)
      .single();

    if (fetchError) throw fetchError;

    const newTotalDonations =
      (currentDonor.total_donations || 0) + donationAmount;
    const lastDonationDate = donationDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("donors")
      .update({
        total_donations: newTotalDonations,
        last_donation_date: lastDonationDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", donorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Donations service
export const donationsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        *,
        donor:donors(*)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(donation: Omit<Donation, "id" | "createdAt" | "updatedAt">) {
    // Debug: Log the received donation data
    console.log("Creating donation with data:", donation);

    // Transform camelCase to snake_case for database
    const dbDonation: Record<string, string | number | null> = {
      donor_id: donation.donorId,
      donation_type: donation.donationType,
      amount: donation.amount,
      payment_mode: donation.paymentMode,
      date_of_donation: donation.dateOfDonation
        ? new Date(donation.dateOfDonation).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      start_date: donation.startDate
        ? new Date(donation.startDate).toISOString().split("T")[0]
        : null,
      end_date: donation.endDate
        ? new Date(donation.endDate).toISOString().split("T")[0]
        : null,
      notes: donation.notes || null,
      created_by: donation.createdBy || null,
    };

    // Add Nepali date fields if they exist (for backwards compatibility)
    if (donation.startDateNepali || donation.endDateNepali) {
      dbDonation.start_date_nepali = donation.startDateNepali || null;
      dbDonation.end_date_nepali = donation.endDateNepali || null;
    }

    // Debug: Log the database payload
    console.log("Database payload:", dbDonation);

    try {
      const { data, error } = await supabase
        .from("donations")
        .insert([dbDonation])
        .select()
        .single();

      if (error) {
        console.error("Supabase error details:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);

        // If the error is about missing columns, try without Nepali date fields
        if (
          error.message?.includes("column") &&
          error.message?.includes("nepali")
        ) {
          console.log(
            "Nepali date columns not found, retrying without them..."
          );
          const dbDonationFallback = { ...dbDonation };
          delete dbDonationFallback.start_date_nepali;
          delete dbDonationFallback.end_date_nepali;

          const { data: fallbackData, error: fallbackError } = await supabase
            .from("donations")
            .insert([dbDonationFallback])
            .select()
            .single();

          if (fallbackError) {
            throw new Error(
              `Database error: ${fallbackError.message} (Code: ${fallbackError.code})`
            );
          }

          console.warn(
            "Created donation without Nepali date fields. Please run the database migration."
          );
          return fallbackData;
        }

        throw new Error(
          `Database error: ${error.message} (Code: ${error.code})`
        );
      }

      return data;
    } finally {
      // Update donor's total donations and last donation date
      // DISABLED: Database trigger 'trigger_update_donor_totals' handles this automatically
      /*
      await donorsService.updateDonationStats(
        donation.donorId,
        donation.amount,
        new Date()
      );
      */
    }
  },

  async getByDonor(donorId: string) {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("donor_id", donorId)
      .is("deleted_at", null)
      .order("date_of_donation", { ascending: false });

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { data, error } = await supabase
      .from("donations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Receipts service
export const receiptsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("receipts")
      .select(
        `
        *,
        donation:donations!inner(
          *,
          donor:donors!inner(
            id, name, email, phone, address, donation_type, membership
          )
        )
      `
      )
      .is("deleted_at", null)
      .is("donation.deleted_at", null)
      .is("donation.donor.deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("receipts")
      .select(
        `
        *,
        donation:donations!inner(
          *,
          donor:donors!inner(
            id, name, email, phone, address, donation_type, membership
          )
        )
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .is("donation.deleted_at", null)
      .is("donation.donor.deleted_at", null)
      .single();

    if (error) throw error;
    return data;
  },

  async create(receipt: Omit<Receipt, "id" | "createdAt" | "receiptNumber">) {
    // Transform camelCase to snake_case for database
    const dbReceipt = {
      donation_id: receipt.donationId,
      issued_at: receipt.issuedAt,
      is_printed: receipt.isPrinted || false,
      is_email_sent: receipt.isEmailSent || false,
    };

    const { data, error } = await supabase
      .from("receipts")
      .insert([dbReceipt])
      .select(
        `
        *,
        donation:donations(
          *,
          donor:donors(
            id, name, email, phone, address, donation_type, membership
          )
        )
      `
      )
      .single();

    if (error) throw error;
    return data;
  },

  async updatePrintStatus(id: string, isPrinted: boolean) {
    const { data, error } = await supabase
      .from("receipts")
      .update({
        is_printed: isPrinted,
        // removed updated_at - let the database trigger handle it
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmailStatus(id: string, isEmailSent: boolean) {
    const { data, error } = await supabase
      .from("receipts")
      .update({
        is_email_sent: isEmailSent,
        // removed updated_at - let the database trigger handle it
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    try {
      console.log("Attempting to soft delete receipt:", id);

      // Use RPC function to avoid trigger conflicts
      const { error } = await supabase.rpc("soft_delete_receipt", {
        receipt_id: id,
      });

      if (error) {
        console.error("Supabase RPC delete error:", error);
        throw new Error(`Failed to delete receipt: ${error.message}`);
      }

      console.log("Successfully soft deleted receipt using RPC");
      return { id, deleted_at: new Date().toISOString() };
    } catch (error) {
      console.error("Receipt delete service error:", error);
      throw error;
    }
  },

  async getDonorHistory(donorId: string) {
    const { data, error } = await supabase
      .from("donations")
      .select(
        `
        *,
        receipt:receipts(*)
      `
      )
      .eq("donor_id", donorId)
      .is("deleted_at", null)
      .order("date_of_donation", { ascending: false });

    if (error) throw error;
    return data;
  },
};

// SMS Events service
export const smsEventsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("sms_events")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(event: Omit<SMSEvent, "id" | "createdAt">) {
    const { data, error } = await supabase
      .from("sms_events")
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Dashboard stats
export const dashboardService = {
  async getStats() {
    try {
      // Get users count
      const { data: users } = await supabase
        .from("users")
        .select("role")
        .is("deleted_at", null);

      // Get donors count
      const { data: donors } = await supabase
        .from("donors")
        .select("id")
        .is("deleted_at", null);

      // Get total donations count and amount
      const { data: donations } = await supabase
        .from("donations")
        .select("amount, payment_mode")
        .is("deleted_at", null);

      // Get receipts count
      const { data: receipts } = await supabase
        .from("receipts")
        .select("id")
        .is("deleted_at", null);

      // Get events count
      const { data: events } = await supabase.from("events").select("id");

      // Use fallback values if any query fails
      const totalUsers = users?.length || 0;
      const adminUsers = users?.filter((u) => u.role === "admin").length || 0;
      const regularUsers = users?.filter((u) => u.role === "user").length || 0;

      const totalDonors = donors?.length || 0;
      const totalDonations = donations?.length || 0;
      const totalReceipts = receipts?.length || 0;
      const totalEvents = events?.length || 0;

      const totalAmount =
        donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      const onlinePayments =
        donations?.filter((d) => d.payment_mode === "Online").length || 0;
      const offlinePayments =
        donations?.filter((d) => d.payment_mode === "Offline").length || 0;
      const qrPayments =
        donations?.filter((d) => d.payment_mode === "QR Payment").length || 0;

      // Get top donors
      const { data: topDonors } = await supabase
        .from("donors")
        .select("id, name, total_donations")
        .is("deleted_at", null)
        .order("total_donations", { ascending: false })
        .limit(5);

      // Get recent receipts (if receiptsService works)
      let recentReceipts = [];
      try {
        recentReceipts = await receiptsService.getAll();
      } catch {
        // If receipts service fails, use empty array
        recentReceipts = [];
      }

      return {
        totalUsers,
        adminUsers,
        regularUsers,
        totalDonors,
        totalDonations,
        totalReceipts,
        totalEvents,
        totalAmount,
        onlinePayments,
        offlinePayments,
        qrPayments,
        topDonors:
          topDonors?.map((d) => ({
            id: d.id,
            name: d.name,
            amount: d.total_donations || 0,
          })) || [],
        recentDonations: recentReceipts?.slice(0, 5) || [],
        upcomingEvents: [], // Can be implemented later
      };
    } catch {
      console.log("Dashboard service error, using fallback data");
      // Return fallback data if database queries fail
      return {
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        totalDonors: 0,
        totalDonations: 0,
        totalReceipts: 0,
        totalEvents: 0,
        totalAmount: 0,
        onlinePayments: 0,
        offlinePayments: 0,
        qrPayments: 0,
        topDonors: [],
        recentDonations: [],
        upcomingEvents: [],
      };
    }
  },

  async getAdminOverview() {
    const { data: allUsers } = await supabase
      .from("users")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    const { data: allDonors } = await supabase
      .from("donors")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    const { data: allReceipts } = await supabase
      .from("receipts")
      .select(
        `
      *,
      donation:donations!inner(
        *,
        donor:donors!inner(*)
      )
    `
      )
      .is("deleted_at", null)
      .is("donation.deleted_at", null)
      .is("donation.donor.deleted_at", null)
      .order("created_at", { ascending: false });
    const { data: allDonations } = await supabase
      .from("donations")
      .select(
        `
      *,
      donor:donors!inner(*)
    `
      )
      .is("deleted_at", null)
      .is("donor.deleted_at", null)
      .order("created_at", { ascending: false });
    const { data: allEvents } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    return {
      users: allUsers || [],
      donors: allDonors || [],
      receipts: allReceipts || [],
      donations: allDonations || [],
      events: allEvents || [],
    };
  },
};
