﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.Sqlite;
using Sujiro.Data;
using Sujiro.WebAPI.Service.AuthService;
using Sujiro.WebAPI.SignalR;
using System.Diagnostics;
using System.Security.Claims;

namespace Sujiro.WebAPI.Controllers.SujirawData
{

    [Route("api/[controller]")]
    [ApiController]
    public class StationController : SujiroAPIController
    {
        public StationController(IHubContext<SujirawHub> hubContext, IConfiguration configuration) : base(hubContext, configuration)
        {
        }

        [HttpGet("{companyID}")]
        public async Task<ActionResult> Get(long companyID)
        {
            try
            {
                string connectionString = Configuration["ConnectionStrings:postgres"]!;
                using (var service = new PostgresDbService(connectionString))
                {
                    var stations = service.GetStationsFromCompany(companyID);
                    return Ok(stations);
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{companyID}")]
        public async Task<ActionResult> Update(long companyID, [FromBody] Station station)
        {
            try
            {
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        [HttpDelete("{companyID}/{stationID}")]
        public async Task<ActionResult> Delete(long companyID, long stationID)
        {
            try
            {
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
