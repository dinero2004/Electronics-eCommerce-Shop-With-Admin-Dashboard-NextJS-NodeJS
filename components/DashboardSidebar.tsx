// *********************
// Role of the component: Sidebar on admin dashboard page
// Name of the component: DashboardSidebar.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <DashboardSidebar />
// Input parameters: no input parameters
// Output: sidebar for admin dashboard page
// *********************

import React from "react";
import { MdDashboard } from "react-icons/md";
import { FaTable } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";
import { FaBagShopping } from "react-icons/fa6";
import { FaStore } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";

import Link from "next/link";
const DashboardSidebar = () => {
  return (
    <div className="xl:w-[400px] bg-amber-50 h-full max-xl:w-full border-r border-amber-100">
      <Link href="/admin">
        <div className="flex gap-x-2 w-full hover:bg-amber-100 transition-colors duration-200 cursor-pointer items-center py-6 pl-5 text-xl text-amber-900">
          <MdDashboard className="text-2xl" />{" "}
          <span className="font-normal">Dashboard</span>
        </div>
      </Link>
      <Link href="/admin/orders">
        <div className="flex gap-x-2 w-full hover:bg-amber-100 transition-colors duration-200 cursor-pointer items-center py-6 pl-5 text-xl text-amber-900">
          <FaBagShopping className="text-2xl" />{" "}
          <span className="font-normal">Orders</span>
        </div>
      </Link>
      <Link href="/admin/products">
        <div className="flex gap-x-2 w-full hover:bg-amber-100 transition-colors duration-200 cursor-pointer items-center py-6 pl-5 text-xl text-amber-900">
          <FaTable className="text-2xl" />{" "}
          <span className="font-normal">Products</span>
        </div>
      </Link>
      <Link href="/admin/bulk-upload">
        <div className="flex gap-x-2 w-full hover:bg-amber-100 transition-colors duration-200 cursor-pointer items-center py-6 pl-5 text-xl text-amber-900">
          <FaFileUpload className="text-2xl" />{" "}
          <span className="font-normal">Bulk Upload</span>
        </div>
      </Link>
      <Link href="/admin/categories">
        <div className="flex gap-x-2 w-full hover:bg-amber-100 transition-colors duration-200 cursor-pointer items-center py-6 pl-5 text-xl text-amber-900">
          <MdCategory className="text-2xl" />{" "}
          <span className="font-normal">Categories</span>
        </div>
      </Link>
      <Link href="/admin/users">
        <div className="flex gap-x-2 w-full hover:bg-amber-100 transition-colors duration-200 cursor-pointer items-center py-6 pl-5 text-xl text-amber-900">
          <FaRegUser className="text-2xl" />{" "}
          <span className="font-normal">Users</span>
        </div>
      </Link>
      <Link href="/admin/merchant">
        <div className="flex gap-x-2 w-full hover:bg-amber-100 transition-colors duration-200 cursor-pointer items-center py-6 pl-5 text-xl text-amber-900">
          <FaStore className="text-2xl" />{" "}
          <span className="font-normal">Merchant</span>
        </div>
      </Link>
      <Link href="/admin/settings">
        <div className="flex gap-x-2 w-full hover:bg-amber-100 transition-colors duration-200 cursor-pointer items-center py-6 pl-5 text-xl text-amber-900">
          <FaGear className="text-2xl" />{" "}
          <span className="font-normal">Settings</span>
        </div>
      </Link>
    </div>
  );
};

export default DashboardSidebar;
