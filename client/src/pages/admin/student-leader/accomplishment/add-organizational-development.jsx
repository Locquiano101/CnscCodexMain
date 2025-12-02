import { useState } from "react";
import { X } from "lucide-react";
import { API_ROUTER } from "../../../../App";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrganizationalDevelopmentModal({
  proposals,
  accomplishmentId,
  orgData,
  onClose,
  open = true,
}) {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    proposal: "",
    accomplishmentId,
    organization: orgData?.organization, // 👈 Add orgId here
    organizationProfile: orgData?._id || "", // 👈 If you also want profileId
  });

  // Category options based on the requirements
  const categoryOptions = [
    {
      value: "Programs, Projects, and Activities (PPAs)",
      label: "Programs, Projects, and Activities (PPAs)",
    },
    { value: "Meetings & Assemblies", label: "Meetings & Assemblies" },
    { value: "Institutional Involvement", label: "Institutional Involvement" },
    { value: "External Activities", label: "External Activities" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If changing category, reset related fields
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        proposal: "", // Reset proposal selection
        title: "", // Reset title when category changes
        description: "", // Reset description when category changes
      }));
    }
    // ✅ If selecting a proposal, populate title and description (only for PPA)
    else if (name === "proposal") {
      const selected = proposals.find((p) => p._id === value);

      console.log(selected);
      setFormData((prev) => ({
        ...prev,
        proposal: value,
        title: selected?.ProposedIndividualActionPlan?.activityTitle || "",
        description: selected?.ProposedIndividualActionPlan?.briefDetails || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle category change from Select component
  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
      proposal: "",
      title: "",
      description: "",
    }));
  };

  // Handle proposal change from Select component
  const handleProposalChange = (value) => {
    const selected = proposals.find((p) => p._id === value);
    console.log(selected);
    setFormData((prev) => ({
      ...prev,
      proposal: value,
      title: selected?.ProposedIndividualActionPlan?.activityTitle || "",
      description: selected?.ProposedIndividualActionPlan?.briefDetails || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const res = await axios.post(`${API_ROUTER}/addAccomplishment`, formData);
      console.log(res.data);
    } catch (error) {
      console.error(error.response);
    }
    onClose();
  };

  // Check if current category is PPA
  const isPPACategory =
    formData.category === "Programs, Projects, and Activities (PPAs)";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[32rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Accomplishment</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new accomplishment report
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {/* Category Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="-- Select Category --" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Proposal Dropdown - Only show for PPA category */}
          {isPPACategory && (
            <div className="space-y-2">
              <Label htmlFor="proposal">Select Proposal</Label>
              <Select
                value={formData.proposal}
                onValueChange={handleProposalChange}
                required={isPPACategory}
              >
                <SelectTrigger id="proposal">
                  <SelectValue placeholder="-- Choose a Proposal --" />
                </SelectTrigger>
                <SelectContent>
                  {proposals.map((proposal) => (
                    <SelectItem key={proposal._id} value={proposal._id}>
                      {proposal.ProposedIndividualActionPlan?.activityTitle ||
                        "Untitled Proposal"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder={
                isPPACategory
                  ? "Title will auto-populate when you select a proposal"
                  : "Enter title for this " + formData.category.toLowerCase()
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={
                isPPACategory
                  ? "Description will auto-populate when you select a proposal"
                  : "Enter description for this " +
                    formData.category.toLowerCase()
              }
            />
          </div>
          
          <p className="text-sm italic text-gray-500">
            Note: This entry serves as an initial submission intent of an
            accomplishment. Additional details will be provided as required.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
