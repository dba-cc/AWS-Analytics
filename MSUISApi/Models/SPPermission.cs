﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MSUISApi.Models
{
    public class SPPermission
    {
        public string user { get; set; }
        public string database { get; set; }
        public string SPName { get; set; }
        public bool? EXECUTE { get; set; }
        public bool? ALTER { get; set; }
        public bool? CONTROL { get; set; }
        public bool? VIEWDEFINITION { get; set; }
    }
}