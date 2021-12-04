App = {
    contracts: {},
    
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
    },
  
	/**
	 * This "loadWeb3" function is used to connect the chrome metamask extension to ganache tool
	 * This function is predefined by the metamask, ref 
	 * Refference- // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
	 */
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.") 
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
    
    
	/**
	 * This function is reading the first blockchain address from the metamask extension on the chrome.
	 */
    loadAccount: async () => {
      // Set the current blockchain account
      web3.eth.defaultAccount = web3.eth.accounts[0]
      App.account = web3.eth.defaultAccount
      App.account = web3.eth.accounts[0]
    },
    
	/**
	 * This function is creating the instance of smart contract using its JSON file. Smart contract instance is stored
	 * in the todoList variable.
	 */
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      const todoList = await $.getJSON('UniversityDegreeChain.json')
      App.contracts.UniversityDegreeChain = TruffleContract(todoList)
      App.contracts.UniversityDegreeChain.setProvider(App.web3Provider)
      
      // Hydrate the smart contract with values from the blockchain
      App.todoList = await App.contracts.UniversityDegreeChain.deployed()
    },
    
    /**
	 * This function is used render the information from the blockchain network to the html page based on blockchain 
	 * address currently logged onto metamask extension   
	 */
    render: async () => {
    // Prevent double render
      if (App.loading) {
        return
      }
      // Render Account
      $('#account').html(App.account)
	     
     //***************************************************
      await App.renderEachStudents()
      await App.StudentVerification()
      await App.renderCompanyReqList()
      //*********************************************
  
  
      
      
	  //var director - Stores the account address of director
      const director = await App.todoList.Director()
	  //var director - Stores the account address of CSE HOD
      const CSE_hod = await App.todoList.CSE_Hod()
	  //var director - Stores the account address of MECHANICAL HOD
      const Mech_hod = await App.todoList.MECH_Hod()
	  //var director - Stores the account address of civil HOD
      const Civil_hod = await App.todoList.CIVIL_Hod()
	  //var director - Stores the account address of EE HOD
      const EE_hod = await App.todoList.EE_Hod()
      
      
	  //Ensure that currently Director account is logged into metamask and render page according to him.
      if(App.account == director)
      {
          await App.renderHODs()
          await App.renderStudents()
          await App.renderCompany()
      }
      
      //Ensure that currently CSE hod account is logged into metamask
      if(App.account == CSE_hod)
      {
          await App.renderCSE_students()
          
      }
      
	  //Ensure that currently mechaincal account is logged into metamask
      if(App.account == Mech_hod)
      { 
          await App.renderMech_students()
      }
      
	  //Ensure that currently civil hod account is logged into metamask
      if(App.account == Civil_hod)
      {
          await App.renderCivil_students()
      
      }
      //Ensure that currently EE hod account is logged into metamask
      if(App.account == EE_hod)
      {
          await App.renderEE_students()
      
      }
  setLoading(false)
    
    },
    
	/**
	 * This "addStudent" function is adding information of students which is provided by the student in the registration form to the college blockchain netwrk
	 * Call Solidity function "addStudent" to add them to blockchain network
	 */
    addStudent: async () => {
    
    
    const Name = $('#stu_name').val()
    var department = $('#depart').val()
    var program = $('#program').val()
    var doj = $('#doj').val()
    var rollno = $('#rollno').val()
    
    console.log(department)
    
	//Passing the values of a HTML form to the smart contract function
    await App.todoList.addStudent(Name,rollno,department,program,doj,false,false)
    
    window.location.reload()
    
    },
    /**This function is reading the values from HTML page and passing it to the smart contract function addHOD whose
	 * parameters department, Hod name, hod id, isverified by director.
	 */
    addHod: async () => {
    //Reading the values from HTML based id
    const HName = $('#Hname').val()
    var department = $('#hod_dep').val()
    var id = $('#id').val()
	
	//Passing the values of a HTML form to the smart contract function.
    await App.todoList.addHOD(department , HName, id, false)
    
    window.location.reload()
    
    },
    /**This function is reading the values from HTML page and passing it to the smart contract function addCompany whose
	 * parameters company name, Year of establishment, domain of work, location ,isverified by director.
	 */
    addCompany: async () => {
	//Reading the values from HTML based on id of HTML tag
    var comp_name = $('#Cname').val()
    var yoe = $('#YOE').val()
    var domain = $('#Domain').val()
    var loc = $('#Location').val()
    
    
    //Passing the values of a HTML form to the smart contract function.
    await App.todoList.addCompany(comp_name, yoe, domain , loc, false)
    window.location.reload()
    
    },
    
	/**
	 * This function is used by the Director to Assign HOD to the department
	 * Director will verify the details of HOD and assign them
	 */
    verifyHOD: async () => {
    
    var id = $('#val').val()
    
	//Passing HOD unique Id to the Solidity function
    await App.todoList.Verify_HOD(id)
    window.location.reload()
   
    },
    
	/**
	 * This function is used to verify student basic details
	 */
    VerificationByHOD: async () => {
    
    var id = $('#rollno_student').val()
	//id is the Roll number of the Student whose inforamtion has to verified by the HOD is passing through Solidity function VerificationByHODs
    await App.todoList.VerificationByHODs(id)
    window.location.reload()
   
    },
    
    
    
    
    /**This function is reading the values from HTML page and passing it to the smart contract function 
	 * Update_SemesterGrades whose parameters contains grades of all semester and backlog status.
	 */    
    Updatemarks: async () => {
        //Reading the values from HTML based on id of HTML tag
        var sem1 = $('#sem1').val()
        var sem2 = $('#sem2').val()
        var sem3 = $('#sem3').val()
        var sem4 = $('#sem4').val()
        var sem5 = $('#sem5').val()
        var sem6 = $('#sem6').val()
        var sem7 = $('#sem7').val()
        var sem8 = $('#sem8').val()
        
        //reading value of is_backlog from html dropdown it can be 0 or 1
        var is_backlog = $('#bc').val()
        
		//converting the value of is_backlog from 0 to false and 1 to true boolean values. 
        var flag_backlog = true; 
        if(is_backlog == 0)
        {flag_backlog = false;}
        
        console.log('From Degree Form',is_backlog)
        var flag_backlog = true; 
        if(is_backlog == 0)
        {flag_backlog = false;}
         console.log('From Degree Form',flag_backlog)
        
        console.log(sem1)
        console.log(sem2)
        //passing all the parameter to the function of smart contract Update_SemesterGrades
        await App.todoList.Update_SemesterGrades(sem1,sem2,sem3,sem4,sem5,sem6,sem7,sem8, flag_backlog)
        window.location.reload()
   
    },
    
    
  
   /**
	 * This function is used to verify the Student Degree details by their respective HODs and Director
	 */ 
    Student_verification: async () => {
   
	// Reading roll number of the student from html file. 
    var roll_no = $('#req').val()
    
   //Passing roll number of the student whose details degree has to be verified to the solidity function. 
    await App.todoList.All_Data_Verification(roll_no)
    window.location.reload()
   
    },
    
	/**This function is reading the values from smart contract mapping "Students" and "SemesterDetails" and rendering
	 * the values to the table on the HTML page. Student details are rendered based on the "account address" of the student
	 * submitted by the HOD or Director for Student's verification purpose.
	 */ 
    showStudentDetails1: async () => {
      //Reading the value of account address of student which is submitted by HOD or Director.   
      var addressStudent = $('#addressStudent').val()
        
      const student_account = addressStudent
     //Load the total number of Student using the global variable inside smart contract StudEnrollNo 
	  const taskCount = await App.todoList.StudEnrollNo()
	 
	  //Creating some templates based on class of some HTML tags that will be used render student details on them.
      const $taskTemplate = $('.HDstudentDetails')
      const $semesterTemplate = $('.HDsemesterinfo')
      const $backlogTemplate = $('.HDis_backlog')
  
      // Looping over each student to get the desired student based on some condition
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Students(i)
        const account = task[0]
        
		//Looking for the account address of the student in the smart contract which matches with the account address
		//passed by HOD or Director on the client side.
        if(student_account == account)
        {
                  //Fetching grades of all the semester of desired student.
                  const marks = await App.todoList.SemesterDetails(student_account)
                  
                  const sem1 = marks[1].toNumber()
                  const sem2 = marks[2].toNumber()
                  const sem3 = marks[3].toNumber()
                  const sem4 = marks[4].toNumber()
                  const sem5 = marks[5].toNumber()
                  const sem6 = marks[6].toNumber()
                  const sem7 = marks[7].toNumber()
                  const sem8 = marks[8].toNumber()
                  const is_backlog = marks[9]
                  const deg_byHOD = marks[10]
                  const deg_byDir = marks[11]
                  
                  var hod_degverify = "Pending"
			//If degree is verified by HOD  i.e true showing this details as done else pending	  
            if(deg_byHOD)
            {
                hod_degverify = "Done"
            }
            
            var dir_degverify = "Pending"

			//If degree is verified by Director i.e true showing this details as done else pending
            if(deg_byDir)
            {
           dir_degverify = "Done"
            }
                  console.log(is_backlog)
                  
                  var isback = "NO"
                  if(is_backlog == true)
                  {
                        isback = "YES"
                  }
              
              
                  const $newbacklogTemplate = $backlogTemplate.clone()
                  $newbacklogTemplate.find('.HDbacklog').html(isback)
                  $('#HDbackloginfo').append($newbacklogTemplate)
                  $newbacklogTemplate.show()
                  
                  //looking for the html tag classes where all semester grades need be displayed
                  const $newSemesterTemplate = $semesterTemplate.clone()
                  $newSemesterTemplate.find('.HDs1').html(sem1)
                  $newSemesterTemplate.find('.HDs2').html(sem2)
                  $newSemesterTemplate.find('.HDs3').html(sem3)
                  $newSemesterTemplate.find('.HDs4').html(sem4)
                  $newSemesterTemplate.find('.HDs5').html(sem5)
                  $newSemesterTemplate.find('.HDs6').html(sem6)
                  $newSemesterTemplate.find('.HDs7').html(sem7)
                  $newSemesterTemplate.find('.HDs8').html(sem8)
                  
				  //finally appending all the grades on the HTML page
                  $('#HDsemList').append($newSemesterTemplate)
                  $newSemesterTemplate.show()
            
			//fetching all other information of student from smart contract like name, roll no, department etc
            const Enroll_no = i
            const Roll_no = task[2]
            const name = task[3]
            const depart = task[4].toNumber()
            const prog = task[5].toNumber()
            const doj = task[6]
            const Hod_verified = task[7]
            const Dir_verified = task[8]
                      
  
            //If student is verified by HOD  i.e true showing this details as done else pending
            var hod_verify = "Pending"
            if(Hod_verified)
            {
                hod_verify = "Done"
            }
            
			//If student is verified by Director  i.e true showing this details as done else pending
            var dir_verify = "Pending"
            if(Dir_verified)
            {
           dir_verify = "Done"
            }
            
            //Assigning the department based on the no 1=CSE, 2=Mechanical, 3= Civil, 4 = Electrical
            var dept = "CSE"
            if(depart == 2)
            {
                dept = "Mechanical"
            }
            else if(depart == 3)
            {
          dept = "Civil"
            }
            else if(depart == 4)
            {
          dept = "Electrical"
            }
            
            var program = "BTECH"
            if(prog == 2)
            {
           program = "MTECH"
            }
            
            //looking for the html tag classes where all semester grades need be displayed
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.HDStud_detail1').html(account)
            $newTaskTemplate.find('.HDStud_detail2').html(i)
            $newTaskTemplate.find('.HDStud_detail3').html(name)
            $newTaskTemplate.find('.HDStud_detail4').html(dept)
            $newTaskTemplate.find('.HDStud_detail5').html(program)
            $newTaskTemplate.find('.HDStud_detail6').html(doj)
            $newTaskTemplate.find('.HDStud_detail7').html(hod_verify)
            $newTaskTemplate.find('.HDStud_detail8').html(dir_verify)
            $newTaskTemplate.find('.HDStud_detail9').html(hod_degverify)
            $newTaskTemplate.find('.HDStud_detail10').html(dir_degverify)
            
			//finally appending all the personal details of student on the HTML page
            $('#HDtaskList').append($newTaskTemplate)
            $newTaskTemplate.show()
      }
      }
        
        
    
    
    },
    
    /**This function is reading the values from smart contract mapping "Students" and "SemesterDetails" and rendering
	 * the values to the table on the HTML page. Student details are rendered based on the "account address" of the student
	 * submitted by the HOD or Director for Student's verification purpose.
	 */ 
    showStudentDetails2: async () => {
        //Reading the value of account address of student which is submitted by HOD or Director. 
        var addressStudent = $('#addressStudent1').val()
        
        // Load the total task count from the blockchain
      const student_account = addressStudent
	  //Load the total number of Student using the global variable inside smart contract StudEnrollNo 
      const taskCount = await App.todoList.StudEnrollNo()
	  
	//Creating some templates based on class of some HTML tags that will be used render student details on them.
      const $taskTemplate = $('.HDstudentDetails')
      const $semesterTemplate = $('.HDsemesterinfo')
      const $backlogTemplate = $('.HDis_backlog')
  
     // Looping over each student to get the desired student based on some condition
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Students(i)
        const account = task[0]
        
		//Looking for the account address of the student in the smart contract which matches with the account address
		//passed by HOD or Director on the client side.
        if(student_account == account)
        {
                  //Fetching grades of all the semester of desired student.
                  const marks = await App.todoList.SemesterDetails(student_account)
                  
                  const sem1 = marks[1].toNumber()
                  const sem2 = marks[2].toNumber()
                  const sem3 = marks[3].toNumber()
                  const sem4 = marks[4].toNumber()
                  const sem5 = marks[5].toNumber()
                  const sem6 = marks[6].toNumber()
                  const sem7 = marks[7].toNumber()
                  const sem8 = marks[8].toNumber()
                  const is_backlog = marks[9]
                  const deg_byHOD = marks[10]
                  const deg_byDir = marks[11]
                  
            var hod_degverify = "Pending"
			//If degree is verified by HOD  i.e true showing this details as done else pending	  
            if(deg_byHOD)
            {
                hod_degverify = "Done"
            }
            
            var dir_degverify = "Pending"
			//If degree is verified by Director i.e true showing this details as done else pending
            if(deg_byDir)
            {
           dir_degverify = "Done"
            }
              
                  var isback = "NO"
                  if(is_backlog == true)
                  {
                        isback = "YES"
                  }
              
                  const $newbacklogTemplate = $backlogTemplate.clone()
                  $newbacklogTemplate.find('.HDbacklog').html(isback)
                  $('#HDbackloginfo').append($newbacklogTemplate)
                  $newbacklogTemplate.show()
                  
                  //looking for the html tag classes where all semester grades need be displayed
                  const $newSemesterTemplate = $semesterTemplate.clone()
                  $newSemesterTemplate.find('.HDs1').html(sem1)
                  $newSemesterTemplate.find('.HDs2').html(sem2)
                  $newSemesterTemplate.find('.HDs3').html(sem3)
                  $newSemesterTemplate.find('.HDs4').html(sem4)
                  $newSemesterTemplate.find('.HDs5').html(sem5)
                  $newSemesterTemplate.find('.HDs6').html(sem6)
                  $newSemesterTemplate.find('.HDs7').html(sem7)
                  $newSemesterTemplate.find('.HDs8').html(sem8)
                  
                  $('#HDsemList').append($newSemesterTemplate)
                  $newSemesterTemplate.show()
                  
            const Enroll_no = i
            const Roll_no = task[2]
            const name = task[3]
            const depart = task[4].toNumber()
            const prog = task[5].toNumber()
            const doj = task[6]
            const Hod_verified = task[7]
            const Dir_verified = task[8]
                      
            //If student is verified by HOD  i.e true showing this details as done else pending
            var hod_verify = "Pending"
            if(Hod_verified)
            {
                hod_verify = "Done"
            }
            //If student is verified by Director  i.e true showing this details as done else pending
            var dir_verify = "Pending"
            if(Dir_verified)
            {
           dir_verify = "Done"
            }
            
            //Assigning the department based on the no 1=CSE, 2=Mechanical, 3= Civil, 4 = Electrical
            var dept = "CSE"
            if(depart == 2)
            {
                dept = "Mechanical"
            }
            else if(depart == 3)
            {
          dept = "Civil"
            }
            else if(depart == 4)
            {
          dept = "Electrical"
            }
            
            var program = "BTECH"
            if(prog == 2)
            {
           program = "MTECH"
            }
            
          //looking for the html tag classes where all semester grades need be displayed
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.HDStud_detail1').html(account)
            $newTaskTemplate.find('.HDStud_detail2').html(i)
            $newTaskTemplate.find('.HDStud_detail3').html(name)
            $newTaskTemplate.find('.HDStud_detail4').html(dept)
            $newTaskTemplate.find('.HDStud_detail5').html(program)
            $newTaskTemplate.find('.HDStud_detail6').html(doj)
            $newTaskTemplate.find('.HDStud_detail7').html(hod_verify)
            $newTaskTemplate.find('.HDStud_detail8').html(dir_verify)
            $newTaskTemplate.find('.HDStud_detail9').html(hod_degverify)
            $newTaskTemplate.find('.HDStud_detail10').html(dir_degverify)
            $('#HDtaskList').append($newTaskTemplate)
			//finally appending all the personal details of student on the HTML page
            $newTaskTemplate.show()
      }
      }
        
        
    
    
    },
    
    /**This function is reading the values from smart contract mapping "Students" and "SemesterDetails" and rendering
	 * the values to the table on the HTML page. Student details are rendered based on the "account address" of the student
	 * submitted by the HOD or Director for Student's verification purpose.
	 */ 
    renderEachStudents: async () => {
	   //Reading the value of account address of student from the metamask.
      const student_account = App.account
	   //Load the total number of Student using the global variable inside smart contract StudEnrollNo
      const taskCount = await App.todoList.StudEnrollNo()
	  
	//Creating some templates based on class of some HTML tags that will be used render student details on them.
      const $taskTemplate = $('.studentDetails')
      const $semesterTemplate = $('.semesterinfo')
      const $backlogTemplate = $('.is_backlog')
  
     // Looping over each student to get the desired student based on some condition
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Students(i)
        const account = task[0]
        
		//Looking for the account address of the student in the smart contract which matches with the account address
		//passed by HOD or Director on the client side.
        if(student_account == account)
        {
                  //Fetching grades of all the semester of desired student.
                  const marks = await App.todoList.SemesterDetails(student_account)
                  
                  const sem1 = marks[1].toNumber()
                  const sem2 = marks[2].toNumber()
                  const sem3 = marks[3].toNumber()
                  const sem4 = marks[4].toNumber()
                  const sem5 = marks[5].toNumber()
                  const sem6 = marks[6].toNumber()
                  const sem7 = marks[7].toNumber()
                  const sem8 = marks[8].toNumber()
                  const is_backlog = marks[9]
                  const deg_byHOD = marks[10]
                  const deg_byDir = marks[11]
                  
                  var hod_degverify = "Pending"
			//If degree is verified by HOD  i.e true showing this details as done else pending	  
            if(deg_byHOD)
            {
                hod_degverify = "Done"
            }
            //If degree is verified by Director i.e true showing this details as done else pending
            var dir_degverify = "Pending"
            if(deg_byDir)
            {
           dir_degverify = "Done"
            }
                  
                  var isback = "NO"
                  if(is_backlog == true)
                  {
                        isback = "YES"
                  }
                  console.log(is_backlog)
              
                  const $newbacklogTemplate = $backlogTemplate.clone()
                  $newbacklogTemplate.find('.backlog').html(isback)
                  $('#backloginfo').append($newbacklogTemplate)
                  $newbacklogTemplate.show()
                  
                  
                  //looking for the html tag classes where all semester grades need be displayed
                  const $newSemesterTemplate = $semesterTemplate.clone()
                  $newSemesterTemplate.find('.s1').html(sem1)
                  $newSemesterTemplate.find('.s2').html(sem2)
                  $newSemesterTemplate.find('.s3').html(sem3)
                  $newSemesterTemplate.find('.s4').html(sem4)
                  $newSemesterTemplate.find('.s5').html(sem5)
                  $newSemesterTemplate.find('.s6').html(sem6)
                  $newSemesterTemplate.find('.s7').html(sem7)
                  $newSemesterTemplate.find('.s8').html(sem8)
                  
                  
                  $('#semList').append($newSemesterTemplate)
                  $newSemesterTemplate.show()
                  
            const Enroll_no = i
            const Roll_no = task[2]
            const name = task[3]
            const depart = task[4].toNumber()
            const prog = task[5].toNumber()
            const doj = task[6]
            const Hod_verified = task[7]
            const Dir_verified = task[8]
                      
        //    console.log("Inside Render")
        //    console.log(name)
            
            var hod_verify = "Pending"
            if(Hod_verified)
            {
                hod_verify = "Done"
            }
            
            var dir_verify = "Pending"
            if(Dir_verified)
            {
           dir_verify = "Done"
            }
            
            //Assigning the department based on the no 1=CSE, 2=Mechanical, 3= Civil, 4 = Electrical
            var dept = "CSE"
            if(depart == 2)
            {
                dept = "Mechanical"
            }
            else if(depart == 3)
            {
          dept = "Civil"
            }
            else if(depart == 4)
            {
          dept = "Electrical"
            }
            
            var program = "BTECH"
            if(prog == 2)
            {
           program = "MTECH"
            }
            
            //looking for the html tag classes where all semester grades need be displayed
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.Stud_detail1').html(account)
            $newTaskTemplate.find('.Stud_detail2').html(i)
            $newTaskTemplate.find('.Stud_detail3').html(name)
            $newTaskTemplate.find('.Stud_detail4').html(dept)
            $newTaskTemplate.find('.Stud_detail5').html(program)
            $newTaskTemplate.find('.Stud_detail6').html(doj)
            $newTaskTemplate.find('.Stud_detail7').html(hod_verify)
            $newTaskTemplate.find('.Stud_detail8').html(dir_verify)
            $newTaskTemplate.find('.Stud_detail9').html(hod_degverify)
            $newTaskTemplate.find('.Stud_detail10').html(dir_degverify)
            
           // $('#completedTaskList').append($newTaskTemplate)
            $('#taskList').append($newTaskTemplate)
            $newTaskTemplate.show()
      }
      }
    },
    
    
   /**
	 * This function is used to verify each student personal detail and degree details
	 * and also render the page according to the director and different hod account number
	 * Director and hod will used the account number of the student who are requesting for their verification to view the details
	 * of the student and manually verifying them 
	 */ 
    StudentVerification: async () => {
    
        const director = await App.todoList.Director()
          const CSE_hod = await App.todoList.CSE_Hod()
          const Mech_hod = await App.todoList.MECH_Hod()
          const Civil_hod = await App.todoList.CIVIL_Hod()
          const EE_hod = await App.todoList.EE_Hod()
    
        const taskCount = await App.todoList.StudEnrollNo()
        const $table1Template = $('.table1')
        const $table2Template = $('.table2')
       
		// Iterator through each student in the networ 
      
		  for (var i = 1; i <= taskCount; i++)
        
			// If current metamask account is logged in with director account then page will render according to director page and 
			// director can verify this request showing on his portal  {
            if(App.account == director)
            {
            
                const task = await App.todoList.Students(i)
                const Hod_verified = task[7]
                const Dir_verified = task[8]
                const account = task[0]
                const studentDetails = await App.todoList.SemesterDetails(account)
                const isBack = studentDetails[9]
                const isHodVerDegree = studentDetails[10]
                const isDirVerDegree = studentDetails[11]
                
                
                if(Hod_verified && Dir_verified == false)
                {
                    const account = task[0]
                    const $requestTemplate = $table1Template.clone()
                        $requestTemplate.find('.table1account').html(account)
                        
                    $('#studentVerification').append($requestTemplate)
                        $requestTemplate.show()
                }
                
                else if(Hod_verified && Dir_verified && isHodVerDegree==true && isDirVerDegree == false)
                {
                
                    console.log("INside CSE HOD DEGREE VERIFICATION")
                     const $requestTemplate = $table2Template.clone()
                       $requestTemplate.find('.table2account').html(account)
                        
                    $('#degreeVerification').append($requestTemplate)
                     $requestTemplate.show()			
                
                }
            }
           // If current metamask account is logged in with CSE_hod account then page will render according to director page and 
			// CSE HOD can verify this request showing on his portal  
            else if(App.account == CSE_hod)
            {
                //console.log("INside CSE HOD")
                const task = await App.todoList.Students(i)
                
                const account = task[0]
                const isHod_Verified = task[7]
                const Dept = task[4]
                const isDir_Verified = task[8]
                
                const studentDetails = await App.todoList.SemesterDetails(account)
                const isBack = studentDetails[9]
                const isHodVerDegree = studentDetails[10]
                
                
                if(Dept == 1 && isHod_Verified == false)
                {//	console.log("INside CSE HOD STUDENT VERIFICATION")
                    const $requestTemplate = $table1Template.clone()
                       $requestTemplate.find('.table1account').html(account)
                        
                    $('#studentVerification').append($requestTemplate)
                     $requestTemplate.show()
                 }
                 else if(Dept == 1 && isHod_Verified == true && isDir_Verified == false && isBack == false && isHodVerDegree 																==false )
                 {
                     console.log("INside CSE HOD DEGREE VERIFICATION")
                     const $requestTemplate = $table2Template.clone()
                       $requestTemplate.find('.table2account').html(account)
                        
                    $('#degreeVerification').append($requestTemplate)
                     $requestTemplate.show()
                 }
            }			// If current metamask account is logged in with mechanical hod account then page will render according to director page and 
			// mechanical can verify this request showing on his portal  
            else if(App.account == Mech_hod)
            {
              //console.log("INside CSE HOD")
                const task = await App.todoList.Students(i)
                
                const account = task[0]
                const isHod_Verified = task[7]
                const Dept = task[4]
                const isDir_Verified = task[8]
                
                const studentDetails = await App.todoList.SemesterDetails(account)
                const isBack = studentDetails[9]
                const isHodVerDegree = studentDetails[10]
                
                
                if(Dept == 2 && isHod_Verified == false)
                {//	console.log("INside CSE HOD STUDENT VERIFICATION")
                    const $requestTemplate = $table1Template.clone()
                       $requestTemplate.find('.table1account').html(account)
                        
                    $('#studentVerification').append($requestTemplate)
                     $requestTemplate.show()
                 }
                 else if(Dept == 2 && isHod_Verified == true && isDir_Verified == false && isBack == false && isHodVerDegree 																==false )
                 {
                     console.log("INside CSE HOD DEGREE VERIFICATION")
                     const $requestTemplate = $table2Template.clone()
                       $requestTemplate.find('.table2account').html(account)
                        
                    $('#degreeVerification').append($requestTemplate)
                     $requestTemplate.show()
                 }
            
            }
           // If current metamask account is logged in with Civil account then page will render according to director page and 
			// civil can verify this request showing on his portal  
            else if(App.account == Civil_hod)
            {
              //console.log("INside CSE HOD")
                const task = await App.todoList.Students(i)
                
                const account = task[0]
                const isHod_Verified = task[7]
                const Dept = task[4]
                const isDir_Verified = task[8]
                
                const studentDetails = await App.todoList.SemesterDetails(account)
                const isBack = studentDetails[9]
                const isHodVerDegree = studentDetails[10]
                
                
                if(Dept == 3 && isHod_Verified == false)
                {//	console.log("INside CSE HOD STUDENT VERIFICATION")
                    const $requestTemplate = $table1Template.clone()
                       $requestTemplate.find('.table1account').html(account)
                        
                    $('#studentVerification').append($requestTemplate)
                     $requestTemplate.show()
                 }
                 else if(Dept == 3 && isHod_Verified == true && isDir_Verified == false && isBack == false && isHodVerDegree 																==false )
                 {
                     console.log("INside CSE HOD DEGREE VERIFICATION")
                     const $requestTemplate = $table2Template.clone()
                       $requestTemplate.find('.table2account').html(account)
                        
                    $('#degreeVerification').append($requestTemplate)
                     $requestTemplate.show()
                 }
            
            }
           
			// If current metamask account is logged in with EE_hod account then page will render according to director page and 
			// EE_hod can verify this request showing on his portal  
            else if(App.account == EE_hod)
            {
              //console.log("INside CSE HOD")
                const task = await App.todoList.Students(i)
                
                const account = task[0]
                const isHod_Verified = task[7]
                const Dept = task[4]
                const isDir_Verified = task[8]
                
                const studentDetails = await App.todoList.SemesterDetails(account)
                const isBack = studentDetails[9]
                const isHodVerDegree = studentDetails[10]
                
                
                if(Dept == 4 && isHod_Verified == false)
                {//	console.log("INside CSE HOD STUDENT VERIFICATION")
                    const $requestTemplate = $table1Template.clone()
                       $requestTemplate.find('.table1account').html(account)
                        
                    $('#studentVerification').append($requestTemplate)
                     $requestTemplate.show()
                 }
                 else if(Dept == 4 && isHod_Verified == true && isDir_Verified == false && isBack == false && isHodVerDegree 																==false )
                 {
                     console.log("INside CSE HOD DEGREE VERIFICATION")
                     const $requestTemplate = $table2Template.clone()
                       $requestTemplate.find('.table2account').html(account)
                        
                    $('#degreeVerification').append($requestTemplate)
                     $requestTemplate.show()
                 }
            
            }
        }
        
   
    },
    
   /**
	 * This function used approve the request given by the company to view the Student information
	 * ONLY director approve this request
	 */ 
    CompanyRequestApproval: async () => {
    console.log("CompanyRequestApproval")
   // var id contains the Request number. 
    var id = $('#Company_reqest').val()
   
	//Passing the request ID to the solidity function "Approve_CompanyRequest"  
    await App.todoList.Approve_CompanyRequest(id)
    window.location.reload()
   
    },
    
   /**This function is used to render the details of students of EE department to Electrical HOD
	 * This function ensures that no other department HOD can view the information of student from another department
	*/ 
    renderEE_students: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.StudEnrollNo()
      const $taskTemplate = $('.studentTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Students(i)
        if(task[4].toNumber()== 4)
        {
        
        
        const account = task[0]
        const Enroll_no = i
        const Roll_no = task[2]
        const name = task[3]
        const depart = task[4].toNumber()
        const prog = task[5].toNumber()
        const doj = task[6]
        const Hod_verified = task[7]
        const Dir_verified = task[8]
        
        var hod_verify = "Pending"
        if(Hod_verified)
        {
            hod_verify = "Done"
        }
        
        var dir_verify = "Pending"
        if(Dir_verified)
        {
           dir_verify = "Done"
        }
        
        
        var dept = "CSE"
        if(depart == 2)
        {
            dept = "Mechanical"
        }
        else if(depart == 3)
        {
          dept = "Civil"
        }
        else if(depart == 4)
        {
          dept = "Electrical"
        }
        
        var program = "BTECH"
        if(prog == 2)
        {
           program = "MTECH"
        }
        
      
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.Stud_content1').html(Enroll_no)
        $newTaskTemplate.find('.Stud_content2').html(Roll_no)
        $newTaskTemplate.find('.Stud_content3').html(name)
        $newTaskTemplate.find('.Stud_content4').html(dept)
        $newTaskTemplate.find('.Stud_content5').html(program)
        $newTaskTemplate.find('.Stud_content6').html(doj)
        $newTaskTemplate.find('.Stud_content7').html(hod_verify)
        $newTaskTemplate.find('.Stud_content8').html(dir_verify)
        
       // $('#completedTaskList').append($newTaskTemplate)
        $('#taskList').append($newTaskTemplate)
        $newTaskTemplate.show()
        
        }
      }
    },
    
   /**This function is used to render the details of students of Civil department to Civil HOD
	 * This function ensures that no other department HOD can view the information of student from another department
	*/ 
    renderCivil_students: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.StudEnrollNo()
      const $taskTemplate = $('.studentTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Students(i)
        if(task[4].toNumber()== 3)
        {
        
        
        const account = task[0]
        const Enroll_no = i
        const Roll_no = task[2]
        const name = task[3]
        const depart = task[4].toNumber()
        const prog = task[5].toNumber()
        const doj = task[6]
        const Hod_verified = task[7]
        const Dir_verified = task[8]
        
        var hod_verify = "Pending"
        if(Hod_verified)
        {
            hod_verify = "Done"
        }
        
        var dir_verify = "Pending"
        if(Dir_verified)
        {
           dir_verify = "Done"
        }
        
        
        var dept = "CSE"
        if(depart == 2)
        {
            dept = "Mechanical"
        }
        else if(depart == 3)
        {
          dept = "Civil"
        }
        else if(depart == 4)
        {
          dept = "Electrical"
        }
        
        var program = "BTECH"
        if(prog == 2)
        {
           program = "MTECH"
        }
        
      
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.Stud_content1').html(Enroll_no)
        $newTaskTemplate.find('.Stud_content2').html(Roll_no)
        $newTaskTemplate.find('.Stud_content3').html(name)
        $newTaskTemplate.find('.Stud_content4').html(dept)
        $newTaskTemplate.find('.Stud_content5').html(program)
        $newTaskTemplate.find('.Stud_content6').html(doj)
        $newTaskTemplate.find('.Stud_content7').html(hod_verify)
        $newTaskTemplate.find('.Stud_content8').html(dir_verify)
        
        $('#taskList').append($newTaskTemplate)
        $newTaskTemplate.show()
        
        }
      }
    },
    
   /**This function is used to render the details of students of Mechanical department to Mechanical HOD
	 * This function ensures that no other department HOD can view the information of student from another department
	*/ 
    renderMech_students: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.StudEnrollNo()
      const $taskTemplate = $('.studentTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Students(i)
        if(task[4].toNumber()== 2)
        {
        
        
        const account = task[0]
        const Enroll_no = i
        const Roll_no = task[2]
        const name = task[3]
        const depart = task[4].toNumber()
        const prog = task[5].toNumber()
        const doj = task[6]
        const Hod_verified = task[7]
        const Dir_verified = task[8]
        
        var hod_verify = "Pending"
        if(Hod_verified)
        {
            hod_verify = "Done"
        }
        
        var dir_verify = "Pending"
        if(Dir_verified)
        {
           dir_verify = "Done"
        }
        
        
        var dept = "CSE"
        if(depart == 2)
        {
            dept = "Mechanical"
        }
        else if(depart == 3)
        {
          dept = "Civil"
        }
        else if(depart == 4)
        {
          dept = "Electrical"
        }
        
        var program = "BTECH"
        if(prog == 2)
        {
           program = "MTECH"
        }
        
      
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.Stud_content1').html(Enroll_no)
        $newTaskTemplate.find('.Stud_content2').html(Roll_no)
        $newTaskTemplate.find('.Stud_content3').html(name)
        $newTaskTemplate.find('.Stud_content4').html(dept)
        $newTaskTemplate.find('.Stud_content5').html(program)
        $newTaskTemplate.find('.Stud_content6').html(doj)
        $newTaskTemplate.find('.Stud_content7').html(hod_verify)
        $newTaskTemplate.find('.Stud_content8').html(dir_verify)
        
       // $('#completedTaskList').append($newTaskTemplate)
        $('#taskList').append($newTaskTemplate)
        $newTaskTemplate.show()
        
        }
      }
    },
   
	/**This function is used to render the details of students of CSE department to CSE HOD
	 * This function ensures that no other department HOD can view the information of student from another department
	*/ 
    renderCSE_students: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.StudEnrollNo()
      const $taskTemplate = $('.studentTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Students(i)
        if(task[4].toNumber()== 1)
        {
        
        
        const account = task[0]
        const Enroll_no = i
        const Roll_no = task[2]
        const name = task[3]
        const depart = task[4].toNumber()
        const prog = task[5].toNumber()
        const doj = task[6]
        const Hod_verified = task[7]
        const Dir_verified = task[8]
       //If Student deatils is verified by HOD  i.e true showing this details as done else pending 
        var hod_verify = "Pending"
        if(Hod_verified)
        {
            hod_verify = "Done"
        }
       //If Student deatils is verified by Director  i.e true showing this details as done else pending 
        var dir_verify = "Pending"
        if(Dir_verified)
        {
           dir_verify = "Done"
        }
        
        
        var dept = "CSE"
        if(depart == 2)
        {
            dept = "Mechanical"
        }
        else if(depart == 3)
        {
          dept = "Civil"
        }
        else if(depart == 4)
        {
          dept = "Electrical"
        }
        
        var program = "BTECH"
        if(prog == 2)
        {
           program = "MTECH"
        }
        
      
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.Stud_content1').html(Enroll_no)
        $newTaskTemplate.find('.Stud_content2').html(Roll_no)
        $newTaskTemplate.find('.Stud_content3').html(name)
        $newTaskTemplate.find('.Stud_content4').html(dept)
        $newTaskTemplate.find('.Stud_content5').html(program)
        $newTaskTemplate.find('.Stud_content6').html(doj)
        $newTaskTemplate.find('.Stud_content7').html(hod_verify)
        $newTaskTemplate.find('.Stud_content8').html(dir_verify)
        
       // $('#completedTaskList').append($newTaskTemplate)
        $('#taskList').append($newTaskTemplate)
        $newTaskTemplate.show()
        
        }
      }
    },
    
    /**This function is reading the values from smart contract mapping "Students" and "SemesterDetails" and rendering
	 * the values to the table on the HTML page. Student details are rendered based on the "account address" of the student
	 * submitted by the HOD or Director for Student's verification purpose.
	 */ 
    SeeStudentInformation: async () => {
		
        console.log("SeeStudentInformation")
        //Reading the value of Student's Roll No from the HTML page
		var S_RollNo = $('#StudentReqRollNo').val()
        
        // Load the total task count from the blockchain
  
      const $taskTemplate = $('.DCREQstudentDetails')
      const $semesterTemplate = $('.DCREQsemesterinfo')
      const $backlogTemplate = $('.DCREQis_backlog')
  
  
        // Fetch the Student's data from the blockchain
        const task = await App.todoList.Students(S_RollNo)
        const account = task[0]
        console.log(account)
        
        //Fetching the director's account address from blockchain
        const director = await App.todoList.Director()
		// Metamask account to director)
        if(App.account == director)
        {
                  
                  const marks = await App.todoList.SemesterDetails(account)
                  
                  const sem1 = marks[1].toNumber()
                  const sem2 = marks[2].toNumber()
                  const sem3 = marks[3].toNumber()
                  const sem4 = marks[4].toNumber()
                  const sem5 = marks[5].toNumber()
                  const sem6 = marks[6].toNumber()
                  const sem7 = marks[7].toNumber()
                  const sem8 = marks[8].toNumber()
                  const is_backlog = marks[9]
                  const deg_byHOD = marks[10]
                  const deg_byDir = marks[11]
                 
				  //If Student deatils is verified by HOD  i.e true showing this details as done else pending 
                  var hod_degverify = "Pending"
            if(deg_byHOD)
            {
                hod_degverify = "Done"
            }
           //If Student deatils is verified by director HOD  i.e true showing this details as done else pending 
            var dir_degverify = "Pending"
            if(deg_byDir)
            {
           dir_degverify = "Done"
            }
                  
                  console.log(is_backlog)
                  console.log(sem1)
                  console.log(sem2)
              
                  const $newbacklogTemplate = $backlogTemplate.clone()
                  $newbacklogTemplate.find('.DCREQbacklog').html(is_backlog)
                  $('#DCREQbackloginfo').append($newbacklogTemplate)
                  $newbacklogTemplate.show()
                  
                  
                  const $newSemesterTemplate = $semesterTemplate.clone()
                  $newSemesterTemplate.find('.DCREQs1').html(sem1)
                  $newSemesterTemplate.find('.DCREQs2').html(sem2)
                  $newSemesterTemplate.find('.DCREQs3').html(sem3)
                  $newSemesterTemplate.find('.DCREQs4').html(sem4)
                  $newSemesterTemplate.find('.DCREQs5').html(sem5)
                  $newSemesterTemplate.find('.DCREQs6').html(sem6)
                  $newSemesterTemplate.find('.DCREQs7').html(sem7)
                  $newSemesterTemplate.find('.DCREQs8').html(sem8)
                  
                  $('#DCREQsemList').append($newSemesterTemplate)
                  $newSemesterTemplate.show()
                             
            const Roll_no = task[2]
            const name = task[3]
            const depart = task[4].toNumber()
            const prog = task[5].toNumber()
            const doj = task[6]
            const Hod_verified = task[7]
            const Dir_verified = task[8]
          )
           //If Student deatils is verified by HOD  i.e true showing this details as done else pending 
            var hod_verify = "Pending"
            if(Hod_verified)
            {
                hod_verify = "Done"
            }
           
			//If Student deatils is verified by Director  i.e true showing this details as done else pending 
            var dir_verify = "Pending"
            if(Dir_verified)
            {
           dir_verify = "Done"
            }
            
           //Assigning the department based on the no 1=CSE, 2=Mechanical, 3= Civil, 4 = Electrical            var dept = "CSE" 
            var dept = "CSE"
            if(depart == 2)
            {
                dept = "Mechanical"
            }
            else if(depart == 3)
            {
          dept = "Civil"
            }
            else if(depart == 4)
            {
          dept = "Electrical"
            }
            
            var program = "BTECH"
            if(prog == 2)
            {
           program = "MTECH"
            }
            
          
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.DCREQStud_detail1').html(account)
            $newTaskTemplate.find('.DCREQStud_detail2').html(S_RollNo)
            $newTaskTemplate.find('.DCREQStud_detail3').html(name)
            $newTaskTemplate.find('.DCREQStud_detail4').html(dept)
            $newTaskTemplate.find('.DCREQStud_detail5').html(program)
            $newTaskTemplate.find('.DCREQStud_detail6').html(doj)
            $newTaskTemplate.find('.DCREQStud_detail7').html(hod_verify)
            $newTaskTemplate.find('.DCREQStud_detail8').html(dir_verify)
            $newTaskTemplate.find('.DCREQStud_detail9').html(hod_degverify)
            $newTaskTemplate.find('.DCREQStud_detail10').html(dir_degverify)
           // $('#completedTaskList').append($newTaskTemplate)
            $('#DCREQtaskList').append($newTaskTemplate)
            $newTaskTemplate.show()
      }
    
    
    },
    
    
   /**
	 * This function is used to see each student personal detail and degree details
	 * and also render the page according to the director and different hod account number
	 * Director and hod will used the account number of the student who are requesting for their verification to view the details
	 * of the student and manually verifying them 
	 */ 
    renderStudents: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.StudEnrollNo()
      const $taskTemplate = $('.studentTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Students(i)
        const account = task[0]
        const Enroll_no = i
        const Roll_no = task[2]
        const name = task[3]
        const depart = task[4].toNumber()
        const prog = task[5].toNumber()
        const doj = task[6]
        const Hod_verified = task[7]
        const Dir_verified = task[8]
        
        console.log(name
		//If Student deatils is verified by HOD  i.e true showing this details as done else pending)
        var hod_verify = "Pending"
        if(Hod_verified)
        {
            hod_verify = "Done"
        }
       //If Student deatils is verified by Director  i.e true showing this details as done else pendin 
        var dir_verify = "Pending"
        if(Dir_verified)
        {
           dir_verify = "Done"
        }
        
       //Assigning the department based on the no 1=CSE, 2=Mechanical, 3= Civil, 4 = Electrical            var dept = "CSE" 
        var dept = "CSE"
        if(depart == 2)
        {
            dept = "Mechanical"
        }
        else if(depart == 3)
        {
          dept = "Civil"
        }
        else if(depart == 4)
        {
          dept = "Electrical"
        }
        
        var program = "BTECH"
        if(prog == 2)
        {
           program = "MTECH"
        }
        
      
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.Stud_content1').html(account)
        $newTaskTemplate.find('.Stud_content2').html(i)
        $newTaskTemplate.find('.Stud_content3').html(name)
        $newTaskTemplate.find('.Stud_content4').html(dept)
        $newTaskTemplate.find('.Stud_content5').html(program)
        $newTaskTemplate.find('.Stud_content6').html(doj)
        $newTaskTemplate.find('.Stud_content7').html(hod_verify)
        $newTaskTemplate.find('.Stud_content8').html(dir_verify)
        
        $('#taskList').append($newTaskTemplate)
        $newTaskTemplate.show()
      }
    },
   
	/**
 * This function will render list of HODs who are registed to the college network
 * ONLY director can see this list
 */ 
    renderHODs: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.HodAddressCount()
      const $taskTemplate = $('.hodTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.HODs(i)
        const id = i
        const account = task[0]
        const unqId = task[1]
        const depart = task[2].toNumber()
        const name = task[3]
        const isHod = task[4]
        var verify = "Pending"
        if(isHod)
        {
            verify = "Done"
            
		//Assigning the department based on the no 1=CSE, 2=Mechanical, 3= Civil, 4 = Electrical            var dept = "CSE"     
        var dept = "CSE"
        if(depart == 2)
        {
            dept = "Mechanical"
        }
        else if(depart == 3)
        {
          dept = "Civil"
        }
        else if(depart == 4)
        {
          dept = "Electrical"
        }
        		// Append the details of HODs to the directors page 
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.content1').html(account)
        $newTaskTemplate.find('.content0').html(id)
        $newTaskTemplate.find('.content3').html(name)
        $newTaskTemplate.find('.content4').html(dept)
        $newTaskTemplate.find('.content5').html(verify)
        
        $('#taskList').append($newTaskTemplate)
        $newTaskTemplate.show()
      }
    },
    
   
   
/**
 *This function will render list of company who are registed to the college network
 * ONLY director can see this list 
 */
    renderCompany: async () => {
      // Load the total task count from the blockchain
      const taskCount = await App.todoList.CompRegNo()
      const $taskTemplate = $('.CompanyTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= taskCount; i++) {
        // Fetch the task data from the blockchain
        const task = await App.todoList.Companies(i)
        const comp_no = task[0].toNumber()
        const Reg_no = i
        const account = task[2]
        const name = task[1]
        const dow = task[4]
        const yoe = task[3]
        const loc = task[5]
        const Dir_Approved = task[6]
        
       //If Company is verified by Director  i.e true showing this details as done else pending 
        var dirverify = "Pending"
        if(Dir_Approved)
        {
           dirverify = "Approved"
        }
        
        console.log(comp_no)		// Appending the companies information to the html page  
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.comp_content1').html(account)
        $newTaskTemplate.find('.comp_content0').html(Reg_no)
        $newTaskTemplate.find('.comp_content2').html(comp_no)
        $newTaskTemplate.find('.comp_content3').html(name)
        $newTaskTemplate.find('.comp_content4').html(dow)
        $newTaskTemplate.find('.comp_content5').html(yoe)
        $newTaskTemplate.find('.comp_content6').html(loc)
        $newTaskTemplate.find('.comp_content7').html(dirverify)
  
        
        $('#taskList').append($newTaskTemplate)
        $newTaskTemplate.show()
      }
    },
/**
 * This function is Rendering the all the requests send by company to the director on the client side.
 * We are creating the instance of "CompaniesRequest" mapping to a variable Request. And from this instance we're 
 * accessing the all the field values of struct "CompaniesRequest" from the smart contract. Here todoList is
 * the instance of our smart contract.
 */
    renderCompanyReqList: async () => {
      // Load the total task count from the blockchain
      const reqCount = await App.todoList.requestId()
      const $taskTemplate = $('.CompanyReqTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= reqCount; i++) {
        // Fetch the task data from the blockchain
        const Request = await App.todoList.CompaniesRequest(i)
        const reqID = Request[0].toNumber()
        const Student_Rno = Request[2].toNumber()
        const Company_name = Request[1]
        const is_ReqApproved = Request[3]
        
       //If Request is verified by Director  i.e true showing this details as done else pending 
        var is_ReqApproved_temp = "Pending"
        if(is_ReqApproved)
        {
           is_ReqApproved_temp = "Approved"
        }
        
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.comp_req_content1').html(reqID)
        $newTaskTemplate.find('.comp_req_content0').html(Company_name)
        $newTaskTemplate.find('.comp_req_content2').html(Student_Rno)
        $newTaskTemplate.find('.comp_req_content3').html(is_ReqApproved_temp)
  
        $('#companyReqtaskList').append($newTaskTemplate)
        $newTaskTemplate.show()
      }
    },
    
    
    
    /**
     * This "ShowStudentDetailsToCompany" shows the information of the Student to Company, according to the request made by the company
     *First company will request the whose information they want to view after getting approved by the director they view the details
	 * of the student using this function 
     */
    
      ShowStudentDetailsToCompany: async () =>{  
      var ReqID = $('#StudentReqID').val()
      console.log(ReqID)
      var CompanyReqInfo = await App.todoList.CompaniesRequest(ReqID)
      var CompanyName = CompanyReqInfo[1]
      var requested_roll_no = CompanyReqInfo[2].toNumber()
      var isReqApproved = CompanyReqInfo[3]
     )
      // Load the total task count from the blockchain
      const company_account = App.account
       console.log(company_account)
      const CompaniesCount = await App.todoList.CompRegNo()
      
     // Ensuring that the company got approved to view the details of the student 
      if(isReqApproved == true)
      {
    )
      //Ensuring Same Company is trying to See Student Detail who has requested for Details
          for (var i = 1; i <= CompaniesCount; i++) {
              console.log("Inside For LOOP")
                const company = await App.todoList.Companies(i)
                console.log(company[2])
                console.log(company[1])
                if(company_account == company[2] && company[1] == CompanyName && company[6] == true)
                {
                   )
  
              const $taskTemplate = $('.CREQstudentDetails')
              const $semesterTemplate = $('.CREQsemesterinfo')
              const $backlogTemplate = $('.CREQis_backlog')
              
              const student = await App.todoList.Students(requested_roll_no)
                    const account = student[0]		
                      
                  const marks = await App.todoList.SemesterDetails(account)
                 // Reading marks of student from the blokchain network 
                  const sem1 = marks[1].toNumber()
                  const sem2 = marks[2].toNumber()
                  const sem3 = marks[3].toNumber()
                  const sem4 = marks[4].toNumber()
                  const sem5 = marks[5].toNumber()
                  const sem6 = marks[6].toNumber()
                  const sem7 = marks[7].toNumber()
                  const sem8 = marks[8].toNumber()
                  const is_backlog = marks[9]
                  const deg_byHOD = marks[10]
                  const deg_byDir = marks[11]
                 
				  //If degree is verified by HOD  i.e true showing this details as done else pending 
                  var hod_degverify = "Pending"
            if(deg_byHOD)
            {
                hod_degverify = "Done"
            }
           
			//If degree is verified by Director  i.e true showing this details as done else pending 
            var dir_degverify = "Pending"
            if(deg_byDir)
            {
           dir_degverify = "Done"
            }
                  
                  console.log(is_backlog)
                  console.log(sem1)
                  console.log(sem2)
              
                  const $newbacklogTemplate = $backlogTemplate.clone()
                  $newbacklogTemplate.find('.CREQbacklog').html(is_backlog)
                  $('#CREQbackloginfo').append($newbacklogTemplate)
                  $newbacklogTemplate.show()
                  
                 // Appending All Semester marks to the html page 
                  const $newSemesterTemplate = $semesterTemplate.clone()
                  $newSemesterTemplate.find('.CREQs1').html(sem1)
                  $newSemesterTemplate.find('.CREQs2').html(sem2)
                  $newSemesterTemplate.find('.CREQs3').html(sem3)
                  $newSemesterTemplate.find('.CREQs4').html(sem4)
                  $newSemesterTemplate.find('.CREQs5').html(sem5)
                  $newSemesterTemplate.find('.CREQs6').html(sem6)
                  $newSemesterTemplate.find('.CREQs7').html(sem7)
                  $newSemesterTemplate.find('.CREQs8').html(sem8)
                  
                  $('#CREQsemList').append($newSemesterTemplate)
                  $newSemesterTemplate.show()
                  
            const Enroll_no = i
            const Roll_no = student[2]
            const name = student[3]
            const depart = student[4].toNumber()
            const prog = student[5].toNumber()
            const doj = student[6]
            const Hod_verified = student[7]
            const Dir_verified = student[8]
                      
            console.log("Inside Render")
            console.log(name)
           
			//If Student deatils is verified by HOD  i.e true showing this details as done else pending 
            var hod_verify = "Pending"
            if(Hod_verified)
            {
                hod_verify = "Done"
            }
           
			//If degree is verified by Director  i.e true showing this details as done else pending 
            var dir_verify = "Pending"
            if(Dir_verified)
            {
           dir_verify = "Done"
            }
            
           //Assigning the department based on the no 1=CSE, 2=Mechanical, 3= Civil, 4 = Electrical            var dept = "CSE" 
            var dept = "CSE"
            if(depart == 2)
            {
                dept = "Mechanical"
            }
            else if(depart == 3)
            {
          dept = "Civil"
            }
            else if(depart == 4)
            {
          dept = "Electrical"
            }
            
            var program = "BTECH"
            if(prog == 2)
            {
           program = "MTECH"
            }
            			// Appending Student personal information of the html page 
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.CREQStud_detail1').html(account)
            $newTaskTemplate.find('.CREQStud_detail2').html(i)
            $newTaskTemplate.find('.CREQStud_detail3').html(name)
            $newTaskTemplate.find('.CREQStud_detail4').html(dept)
            $newTaskTemplate.find('.CREQStud_detail5').html(program)
            $newTaskTemplate.find('.CREQStud_detail6').html(doj)
            $newTaskTemplate.find('.CREQStud_detail7').html(hod_verify)
            $newTaskTemplate.find('.CREQStud_detail8').html(dir_verify)
            $newTaskTemplate.find('.CREQStud_detail9').html(hod_degverify)
            $newTaskTemplate.find('.CREQStud_detail10').html(dir_degverify)
            
            
            $('#CREQtaskList').append($newTaskTemplate)
            $newTaskTemplate.show()
                
        
                }
          }
      }
   
      
    },
    
    /**
     * This "CompanyApproval" function approve the registration made by company
     * It Passes the company registration number(CRN) to the solidiy function "Approve_Company"
     */
    CompanyApproval: async () => {
    
    var id = $('#CompanyID').val()
    
    await App.todoList.Approve_Company(id)
    window.location.reload()
   
    },
    
    
    //Function for Companies to request for student information
    /**
     * This "Company_RequestforStudent" function is used by the companies to request the information of the student.
     *  It Passes Students account number and Roll number to the solidity function "Company_RequestforStudent"
     */  
    Company_RequestforStudent: async () => {
    
    var SaccountNum = $('#SReqAccountNum').val()
    var SrollNum = $('#SReqRollNum').val()
    
    
    await App.todoList.Company_RequestforStudent(SaccountNum,SrollNum)
    window.location.reload()
   
    },
   
    
    
    
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })
  
  
