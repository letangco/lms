const fs = require('fs');
const excel = require('node-excel-export');
import { getAllUser } from '../components/user/user.service';
import { getAllCourse, getAllIntake } from '../components/course/course.service';
import { getUsersByCourse } from '../components/courseUser/courseUser.service';
import { getSha1, getCurrentDateString } from './string.helper';
import { UPLOAD_GET_HOST } from '../config';
const path = require('path');

export async function exportDataExcel() {
  try {
    return new Promise(async (resolve) => {
      const promises = await Promise.all([
        getAllUser(),
        getAllCourse(),
        getAllIntake(),
      ]);
      const data = [];
      data.push(formatUserData(promises[0]));
      data.push(formatCourseData(promises[1]));
      data.push(formatIntakeData(promises[2]));
      data.push(await formatUserCourseData(promises[2]));
      const fileName = `FileExportData-${getCurrentDateString()}-${getSha1(Date.now().toString())}.xlsx`;
      const outputPath = path.join(__dirname, '../../export/' + fileName);
      const report = excel.buildExport(data);
      await fs.writeFile(outputPath, report, function(err) {
        if (err){
          resolve(err)
        }
        resolve(`${UPLOAD_GET_HOST}/export/${fileName}`)
      });
    })
  } catch (error) {
    console.log('Error exportDataExcel : ', error)
  }
}
function getSpecification(data) {
  const results = {};
  data.map((item) => {
    results[item.id] = {
      displayName: item.name, // <- Here you specify the column header
      headerStyle: {}, // <- Header style
      width: 120 // <- width in pixels
    };
  });
  return results;
}

function formatUserData(data) {
  const title = [
    { id: 'email', name: 'Email' },
    { id: 'firstName', name: 'First Name' },
    { id: 'lastName', name: 'Last Name' },
    { id: 'password', name: 'Password' },
    { id: 'type', name: 'User type' },
    { id: 'bio', name: 'Bio' },
    { id: 'status', name: 'Status' }
  ];
  const specification = getSpecification(title);
  const users = [];
  data?.map((user) => {
    users.push({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: '',
      type: user?.type?.key ? user.type.key : '',
      status: user.status
    });
  });
  return {
    name: 'Users',
    specification,
    data: users
  };
}

function formatCourseData(data) {
  const title = [
    { id: 'name', name: 'Course name' },
    { id: 'code', name: 'Course code' },
    { id: 'description', name: 'Description' },
    { id: 'price', name: 'Price' },
    { id: 'status', name: 'Status' }
  ];
  const specification = getSpecification(title);
  const courses = [];
  data?.map((course) => {
    courses.push({
      name: course.name,
      code: course.code,
      description: course.description,
      price: course.price,
      status: course.status
    });
  });
  return {
    name: 'Courses',
    specification,
    data: courses
  };
}

function formatIntakeData(data) {
  const title = [
    { id: 'name', name: 'Intake name' },
    { id: 'code', name: 'Intake code' },
    { id: 'description', name: 'Description' },
    { id: 'price', name: 'Price' },
    { id: 'status', name: 'Status' },
    { id: 'courseName', name: 'Course name' },
    { id: 'courseCode', name: 'Course code' },
  ];
  const specification = getSpecification(title);
  const courses = [];
  data?.map((course) => {
    courses.push({
      name: course.name,
      code: course.code,
      description: course.description,
      price: course.price,
      status: course.status,
      courseName: course?.parent ? course.parent.name : '',
      courseCode: course?.code ? course.parent.code : '',
    });
  });
  return {
    name: 'Intakes',
    specification,
    data: courses
  };
}

export async function formatUserCourseData(data) {
  const title = [
    { id: 'user', name: 'User' },
    { id: 'code', name: 'Course/Intake code' },
    { id: 'name', name: 'Course/Intake name' }
  ];
  const specification = getSpecification(title);
  let userCourses = [];
  if (data?.length) {
    await Promise.all(data.map( async course => {
      const result = await getUsersByCourse(course._id);
      userCourses = userCourses.concat(result);
    }));
  }
  return {
    name: 'UserToCourse(Intake)',
    specification,
    data: userCourses
  };
}
