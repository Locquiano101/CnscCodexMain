import { useEffect, useState } from "react";
import { DropDownComponent } from "./form";

// Define your departments data structure.
// Make sure the keys match exactly how you expect them in formData.department.

export const departments = {
  "College of Arts and Sciences": [
    "Bachelor of Science in Biology",
    "Bachelor of Science in Applied Mathematics",
    "Bachelor of Science in Development Communication",
    "Bachelor of Arts in English Language Studies",
    "Bachelor of Arts in Sociology",
  ],
  "College of Computing and Multimedia Studies": [
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Information Systems",
  ],
  "College of Business and Public Administration": [
    "Bachelor of Science in Business Administration – Business Economics",
    "Bachelor of Science in Business Administration – Financial Management",
    "Bachelor of Science in Business Administration – Marketing Management",
    "Bachelor of Science in Business Administration – Human Resource Management",
    "Bachelor of Science in Accountancy",
    "Bachelor of Science in Hospitality Management",
    "Bachelor of Science in Office Administration",
    "Bachelor of Science in Entrepreneurship",
    "Bachelor in Public Administration",
  ],
  "College of Engineering": [
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Electrical Engineering",
    "Bachelor of Science in Mechanical Engineering",
  ],
  "College of Education": [
    "Bachelor of Elementary Education",
    "Bachelor of Secondary Education – Major in English",
    "Bachelor of Secondary Education – Major in Filipino",
    "Bachelor of Secondary Education – Major in Mathematics",
    "Bachelor of Secondary Education – Major in Social Studies",
    "Bachelor of Secondary Education – Major in Sciences",
    "Bachelor of Technology and Livelihood Education – Home Economics",
    "Bachelor of Physical Education",
  ],
  "College of Trades and Technology": [
    "Bachelor of Technical-Vocational Teacher Education – Garments Fashion and Design",
    "Bachelor of Technical-Vocational Teacher Education – Food Service and Management",
    "Bachelor of Technical-Vocational Teacher Education – Automotive Technology",
    "Bachelor of Technical-Vocational Teacher Education – Electrical Technology",
    "Bachelor of Science in Industrial Technology – Automotive Technology",
    "Bachelor of Science in Industrial Technology – Electrical Technology",
    "Bachelor of Science in Industrial Technology – Computer Technology",
    "Bachelor of Science in Industrial Technology – Electronics Technology",
  ],
  "College of Agriculture and Natural Resources": [
    "Bachelor of Science in Agriculture – Crop Science",
    "Bachelor of Science in Agriculture – Animal Science",
    "Bachelor of Science in Environmental Science",
    "Bachelor in Agricultural Technology",
    "Bachelor of Science in Agricultural and Biosystems Engineering",
  ],
  "Institute of Fisheries and Marine Sciences": [
    "Bachelor of Science in Fisheries",
  ],
  "Alternative Track": [
    "Bachelor of Science in Entrepreneurship (Agricultural Production Track)",
  ],
};

export function CollegeDepartments({ formData = {}, onChange = () => {} }) {
  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    if (formData.organizationDepartment) {
      setCourseOptions(departments[formData.organizationDepartment] || []);
    } else {
      setCourseOptions([]);
    }
  }, [formData.organizationDepartment]);

  const handleDepartmentChange = (selected) => {
    // Immediately update local course options.
    setCourseOptions(departments[selected] || []);
    // Update parent's state.
    onChange({
      ...formData,
      organizationDepartment: selected,
      organizationCourse: undefined, // reset course selection on department change
    });
  };

  const handleCourseChange = (selected) => {
    onChange({
      ...formData,
      organizationCourse: selected,
    });
  };

  return (
    <div className="flex w-full text-sm rounded-2xl gap-2 justify-around">
      <div className="flex flex-col flex-1">
        <label>
          Department <span className="text-red-500">*</span>
        </label>

        <DropDownComponent
          options={Object.keys(departments)}
          onChange={handleDepartmentChange}
          value={formData.organizationDepartment || ""}
        />
      </div>

      <div className="flex flex-col  flex-1">
        <label>
          Course <span className="text-red-500">*</span>
        </label>
        <DropDownComponent
          options={courseOptions}
          onChange={handleCourseChange}
          value={formData.organizationCourse || ""}
          disabled={!formData.organizationDepartment}
        />
      </div>
    </div>
  );
}

export function CollegeSDU({ formData = {}, onChange = () => {} }) {
  // Optionally, if the parent's formData might update externally,
  // you can use a useEffect to update courseOptions when formData.department changes.

  const handleDepartmentChange = (selected) => {
    // Immediately update local course options.
    // Update parent's state.
    onChange({
      ...formData,
      delivery_unit: selected,
    });
  };

  return (
    <div className="  justify-between flex w-full  gap-4">
      <div className=" mr-12">
        <label>Department</label>
      </div>

      <div className="flex-1 w-2/3">
        <DropDownComponent
          options={Object.keys(departments)}
          onChange={handleDepartmentChange}
          value={formData.department || ""}
        />
      </div>
    </div>
  );
}

export function College({ formData = {}, onChange = () => {} }) {
  // Optionally, if the parent's formData might update externally,
  // you can use a useEffect to update courseOptions when formData.department changes.

  const handleDepartmentChange = (selected) => {
    // Immediately update local course options.
    // Update parent's state.
    onChange({
      ...formData,
      adviserDepartment: selected,
    });
  };

  return (
    <div className="flex flex-col w-full justify-around gap-4">
      <div className="flex gap-1 flex-1">
        <DropDownComponent
          options={Object.keys(departments)}
          required={true}
          onChange={handleDepartmentChange}
          value={formData.department || ""}
        />
      </div>
    </div>
  );
}
